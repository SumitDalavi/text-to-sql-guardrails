"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = exports.getDb = exports.initDb = void 0;
const sql_js_1 = __importDefault(require("sql.js"));
let db = null;
async function initDb() {
    if (db)
        return db;
    const SQL = await (0, sql_js_1.default)();
    db = new SQL.Database();
    // Seed the mock e-commerce database
    db.run(`
    CREATE TABLE customers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      signup_date DATE
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      stock INTEGER DEFAULT 0
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER,
      order_date DATE,
      status TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      unit_price DECIMAL(10,2),
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);
    // Insert mock data
    db.run(`
    INSERT INTO customers (id, name, email, signup_date) VALUES 
    (1, 'Alice Smith', 'alice@example.com', '2023-01-15'),
    (2, 'Bob Jones', 'bob@example.com', '2023-02-20'),
    (3, 'Charlie Brown', 'charlie@example.com', '2023-03-10');

    INSERT INTO products (id, name, category, price, stock) VALUES
    (1, 'Laptop', 'Electronics', 999.99, 50),
    (2, 'Mouse', 'Electronics', 25.50, 200),
    (3, 'Desk Chair', 'Furniture', 150.00, 30),
    (4, 'Keyboard', 'Electronics', 45.00, 100);

    INSERT INTO orders (id, customer_id, order_date, status) VALUES
    (1, 1, '2023-05-01', 'shipped'),
    (2, 2, '2023-05-15', 'processing'),
    (3, 1, '2023-06-10', 'delivered');

    INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 1, 999.99),
    (2, 1, 2, 1, 25.50),
    (3, 2, 3, 2, 150.00),
    (4, 3, 4, 1, 45.00);
  `);
    return db;
}
exports.initDb = initDb;
function getDb() {
    if (!db)
        throw new Error("DB not initialized");
    return db;
}
exports.getDb = getDb;
// Executes a read-only query safely (sql.js is entirely in-memory, so it's a sandbox)
function executeQuery(sql) {
    const database = getDb();
    try {
        const res = database.exec(sql);
        if (res.length === 0)
            return [];
        const columns = res[0].columns;
        return res[0].values.map((row) => {
            const obj = {};
            columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    }
    catch (error) {
        throw new Error("SQL Execution Error: " + error.message);
    }
}
exports.executeQuery = executeQuery;
