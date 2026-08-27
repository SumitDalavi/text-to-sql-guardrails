import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from '../src/App';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('App', () => {
  it('renders header correctly', () => {
    render(<App />);
    expect(screen.getByText('Text-to-SQL Gateway')).toBeInTheDocument();
  });

  it('submits query and displays response', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        originalQuestion: 'test',
        generatedSql: 'SELECT * FROM test',
        safeSql: 'SELECT * FROM test LIMIT 100',
        explanation: 'Simple test',
        tablesAccessed: ['test'],
        results: [{ id: 1, name: 'Alice' }],
        executionTimeMs: 10,
        validation: {
          confidence: 95,
          warnings: [],
          backTranslation: 'test',
          alignmentScore: 5
        }
      }
    });

    render(<App />);
    
    const input = screen.getByPlaceholderText(/e.g. What was the total revenue/i);
    const button = screen.getByText('Ask');

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Generated SQL (Safe Execution)')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  it('handles guardrail errors', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Query Blocked by Guardrail',
          details: 'Destructive operation',
          rawSql: 'DROP TABLE test'
        }
      }
    });

    render(<App />);
    
    const input = screen.getByPlaceholderText(/e.g. What was the total revenue/i);
    const button = screen.getByText('Ask');

    fireEvent.change(input, { target: { value: 'drop test' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Guardrail Interception')).toBeInTheDocument();
      expect(screen.getByText('Destructive operation')).toBeInTheDocument();
      expect(screen.getByText('DROP TABLE test')).toBeInTheDocument();
    });
  });
  
  it('handles generic errors', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(<App />);
    
    const input = screen.getByPlaceholderText(/e.g. What was the total revenue/i);
    const button = screen.getByText('Ask');

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('handles quick action buttons', () => {
    render(<App />);
    const delButton = screen.getByText('"Delete all orders"');
    const updateButton = screen.getByText('"Update product price"');
    
    fireEvent.click(delButton);
    expect(screen.getByPlaceholderText(/e.g. What was the total revenue/i)).toHaveValue('Delete all orders from the database.');

    fireEvent.click(updateButton);
    expect(screen.getByPlaceholderText(/e.g. What was the total revenue/i)).toHaveValue('Update the price of product 1 to zero.');
  });

  it('renders different confidence colors and warnings', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        originalQuestion: 'test',
        generatedSql: 'SELECT * FROM test',
        safeSql: 'SELECT * FROM test',
        explanation: 'Simple test',
        tablesAccessed: ['test'],
        results: [],
        executionTimeMs: 10,
        validation: {
          confidence: 75,
          warnings: ['Warning 1', 'Warning 2'],
          backTranslation: 'test',
          alignmentScore: 3
        }
      }
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/e.g. What was the total revenue/i);
    const button = screen.getByText('Ask');

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Warning 1')).toBeInTheDocument();
      expect(screen.getByText('Warning 2')).toBeInTheDocument();
    });
  });

  it('renders low confidence colors', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        originalQuestion: 'test',
        generatedSql: 'SELECT * FROM test',
        safeSql: 'SELECT * FROM test',
        explanation: 'Simple test',
        tablesAccessed: ['test'],
        results: [],
        executionTimeMs: 10,
        validation: {
          confidence: 50,
          warnings: [],
          backTranslation: 'test',
          alignmentScore: 2
        }
      }
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/e.g. What was the total revenue/i);
    const button = screen.getByText('Ask');

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
