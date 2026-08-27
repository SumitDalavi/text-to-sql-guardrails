import request from 'supertest';
import app from '../src/index';
import { enforceGuardrails, GuardrailError } from '../src/sql/guardrails';
import { initDb, getDb, executeQuery } from '../src/db/index';
import { extractSchemaContext } from '../src/db/schemaExtractor';
import { generateSql } from '../src/sql/generator';
import { checkHallucination } from '../src/validation/validator';
import { ChatOpenAI } from '@langchain/openai';

jest.mock('@langchain/openai');

describe('Text to SQL Guardrails System', () => {
  beforeAll(async () => {
    await initDb();
  });

  describe('DB & Schema Extractor', () => {
    it('should initialize db and getDb should return it', () => {
      const db = getDb();
      expect(db).toBeDefined();
    });

    it('should extract schema context correctly', () => {
      const schema = extractSchemaContext();
      expect(schema).toContain('Table: customers');
      expect(schema).toContain('name (TEXT)');
    });

    it('should execute query correctly', () => {
      const res = executeQuery('SELECT * FROM customers LIMIT 1');
      expect(res.length).toBe(1);
      expect(res[0].id).toBe(1);
      expect(res[0].name).toBe('Alice Smith');
    });

    it('should throw error on invalid sql', () => {
      expect(() => executeQuery('SELECT * FROM non_existent')).toThrow('SQL Execution Error');
    });

    it('should return empty array for empty results', () => {
      const res = executeQuery('SELECT * FROM customers WHERE id = 999');
      expect(res).toEqual([]);
    });
  });

  describe('Guardrails', () => {
    it('should reject DROP TABLE queries', () => {
      expect(() => enforceGuardrails('DROP TABLE users;')).toThrow(GuardrailError);
      expect(() => enforceGuardrails('drop table users')).toThrow(GuardrailError);
      expect(() => enforceGuardrails('DELETE FROM users')).toThrow(GuardrailError);
    });

    it('should accept SELECT queries and append LIMIT', () => {
      const sql = 'SELECT * FROM users';
      const safe = enforceGuardrails(sql);
      expect(safe).toBe('SELECT * FROM users LIMIT 100');
    });

    it('should not append LIMIT if already present', () => {
      const sql = 'SELECT * FROM users LIMIT 10';
      const safe = enforceGuardrails(sql);
      expect(safe).toBe('SELECT * FROM users LIMIT 10');
    });
  });

  describe('Generator', () => {
    it('should generate SQL', async () => {
      const mockInvoke = jest.fn().mockResolvedValue({
        sql: 'SELECT * FROM customers',
        explanation: 'Selects all',
        tablesAccessed: ['customers']
      });
      (ChatOpenAI as any).mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({
          invoke: mockInvoke
        })
      }));

      const res = await generateSql('get all customers');
      expect(res.sql).toBe('SELECT * FROM customers');
      expect(mockInvoke).toHaveBeenCalled();
    });
  });

  describe('Validator', () => {
    it('should penalize confidence for no results', async () => {
      const mockInvoke = jest.fn().mockResolvedValue({
        backTranslation: 'Get something that does not exist',
        alignmentScore: 5
      });
      (ChatOpenAI as any).mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({
          invoke: mockInvoke
        })
      }));

      const val = await checkHallucination('get none', 'SELECT * FROM customers WHERE id=999', []);
      expect(val.confidence).toBe(90);
      expect(val.warnings[0]).toContain('returned no results');
    });

    it('should add warning for 100 limit', async () => {
      const mockInvoke = jest.fn().mockResolvedValue({
        backTranslation: 'Get 100 items',
        alignmentScore: 5
      });
      (ChatOpenAI as any).mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({
          invoke: mockInvoke
        })
      }));

      const arr = new Array(100).fill({ id: 1 });
      const val = await checkHallucination('get 100', 'SELECT * FROM customers LIMIT 100', arr);
      expect(val.warnings[0]).toContain('100-row limit');
    });

    it('should penalize for hallucination', async () => {
      const mockInvoke = jest.fn().mockResolvedValue({
        backTranslation: 'Get totally wrong stuff',
        alignmentScore: 2
      });
      (ChatOpenAI as any).mockImplementation(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({
          invoke: mockInvoke
        })
      }));

      const val = await checkHallucination('get customers', 'SELECT * FROM customers', [{id:1}]);
      expect(val.confidence).toBe(55); // 100 - (5-2)*15 = 100 - 45 = 55
      expect(val.warnings[0]).toContain('Hallucination Warning');
    });
  });

  describe('API Endpoints', () => {
    it('GET /api/v1/schema should return schema', async () => {
      const res = await request(app).get('/api/v1/schema');
      expect(res.status).toBe(200);
      expect(res.body.schema).toContain('Table: customers');
    });

    it('POST /api/v1/query should require question', async () => {
      const res = await request(app).post('/api/v1/query').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing question');
    });

    it('POST /api/v1/query should process valid query', async () => {
      const mockInvokeSql = jest.fn().mockResolvedValue({
        sql: 'SELECT * FROM customers',
        explanation: 'Selects all',
        tablesAccessed: ['customers']
      });
      const mockInvokeVal = jest.fn().mockResolvedValue({
        backTranslation: 'Get all customers',
        alignmentScore: 5
      });
      (ChatOpenAI as any)
        .mockImplementationOnce(() => ({
          withStructuredOutput: jest.fn().mockReturnValue({ invoke: mockInvokeSql })
        }))
        .mockImplementationOnce(() => ({
          withStructuredOutput: jest.fn().mockReturnValue({ invoke: mockInvokeVal })
        }));

      const res = await request(app).post('/api/v1/query').send({ question: 'Get all customers' });
      expect(res.status).toBe(200);
      expect(res.body.safeSql).toBe('SELECT * FROM customers LIMIT 100');
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.validation.confidence).toBe(100);
    });

    it('POST /api/v1/query should block destructive query', async () => {
      const mockInvokeSql = jest.fn().mockResolvedValue({
        sql: 'DROP TABLE customers',
        explanation: 'Drops table',
        tablesAccessed: ['customers']
      });
      (ChatOpenAI as any).mockImplementationOnce(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({ invoke: mockInvokeSql })
      }));

      const res = await request(app).post('/api/v1/query').send({ question: 'Drop customers' });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Query Blocked by Guardrail');
    });

    it('POST /api/v1/query should handle 500 errors', async () => {
      const mockInvokeSql = jest.fn().mockRejectedValue(new Error('LLM Failure'));
      (ChatOpenAI as any).mockImplementationOnce(() => ({
        withStructuredOutput: jest.fn().mockReturnValue({ invoke: mockInvokeSql })
      }));

      const res = await request(app).post('/api/v1/query').send({ question: 'Fail' });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('LLM Failure');
    });
  });
});
