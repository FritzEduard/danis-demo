CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  created TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  mode TEXT NOT NULL,
  addr TEXT,
  due TEXT,
  note TEXT,
  pay TEXT NOT NULL,
  items TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery INTEGER NOT NULL,
  total INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_status ON orders(status, created);
