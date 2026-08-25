import { getDb } from './index';

export function extractSchemaContext(): string {
  const db = getDb();
  
  // Get all tables
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  if (tables.length === 0) return "";
  
  let schemaContext = "";
  
  for (const row of tables[0].values) {
    const tableName = row[0] as string;
    schemaContext += `Table: ${tableName}\n`;
    
    // Get table info (columns)
    const columnsInfo = db.exec(`PRAGMA table_info(${tableName})`);
    if (columnsInfo.length > 0) {
      columnsInfo[0].values.forEach((col: any[]) => {
        const colName = col[1];
        const colType = col[2];
        const isPk = col[5] ? "PRIMARY KEY" : "";
        schemaContext += `  - ${colName} (${colType}) ${isPk}\n`;
      });
    }
    
    // Get foreign keys
    const fkInfo = db.exec(`PRAGMA foreign_key_list(${tableName})`);
    if (fkInfo.length > 0) {
      fkInfo[0].values.forEach((fk: any[]) => {
        const fromCol = fk[3];
        const toTable = fk[2];
        const toCol = fk[4];
        schemaContext += `  - Foreign Key: ${fromCol} -> ${toTable}(${toCol})\n`;
      });
    }
    
    schemaContext += "\n";
  }
  
  return schemaContext.trim();
}
