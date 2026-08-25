describe('Text to SQL Guardrails', () => {
  it('should reject DROP TABLE queries', () => {
    const query = "DROP TABLE users;";
    const isSafe = !query.toUpperCase().includes('DROP TABLE');
    expect(isSafe).toBe(false);
  });

  it('should accept SELECT queries', () => {
    const query = "SELECT * FROM users;";
    const isSafe = !query.toUpperCase().includes('DROP TABLE');
    expect(isSafe).toBe(true);
  });
});
