-- Owner overrides of the built-in website texts (see texts.js). Only changed entries are stored.
CREATE TABLE IF NOT EXISTS texts (
  lang TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (lang, key)
);
