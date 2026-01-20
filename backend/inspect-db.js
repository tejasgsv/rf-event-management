const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

(async () => {
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rf_event_management',
  };
  const conn = await mysql.createConnection(cfg);

  const [tables] = await conn.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
    [cfg.database]
  );

  console.log(`\nDatabase: ${cfg.database}`);
  console.log(`Tables (${tables.length}):`, tables.map(t => t.TABLE_NAME).join(', ') || '(none)');

  for (const { TABLE_NAME } of tables) {
    console.log(`\n=== ${TABLE_NAME} ===`);
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`, [cfg.database, TABLE_NAME]
    );
    cols.forEach(c => {
      console.log(`- ${c.COLUMN_NAME}: ${c.COLUMN_TYPE} ${c.IS_NULLABLE === 'NO' ? 'NOT NULL' : ''} ${c.EXTRA || ''}`.trim());
    });

    const [pk] = await conn.query(
      `SELECT k.COLUMN_NAME
       FROM information_schema.TABLE_CONSTRAINTS t
       JOIN information_schema.KEY_COLUMN_USAGE k USING (CONSTRAINT_NAME, TABLE_SCHEMA, TABLE_NAME)
       WHERE t.TABLE_SCHEMA = ? AND t.TABLE_NAME = ? AND t.CONSTRAINT_TYPE = 'PRIMARY KEY'
       ORDER BY k.ORDINAL_POSITION`, [cfg.database, TABLE_NAME]
    );
    console.log('Primary Key:', pk.map(x => x.COLUMN_NAME).join(', ') || '(none)');

    const [fk] = await conn.query(
      `SELECT k.COLUMN_NAME, k.REFERENCED_TABLE_NAME AS ref_table, k.REFERENCED_COLUMN_NAME AS ref_column
       FROM information_schema.KEY_COLUMN_USAGE k
       WHERE k.TABLE_SCHEMA = ? AND k.TABLE_NAME = ? AND k.REFERENCED_TABLE_NAME IS NOT NULL
       ORDER BY k.ORDINAL_POSITION`, [cfg.database, TABLE_NAME]
    );
    fk.forEach(x => console.log(`FK: ${x.COLUMN_NAME} -> ${x.ref_table}.${x.ref_column}`));

    const [idx] = await conn.query(
      `SELECT INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns, NON_UNIQUE
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       GROUP BY INDEX_NAME, NON_UNIQUE
       ORDER BY (INDEX_NAME = 'PRIMARY') DESC, INDEX_NAME`, [cfg.database, TABLE_NAME]
    );
    idx.forEach(i => console.log(`Index: ${i.INDEX_NAME} (${i.NON_UNIQUE ? 'NON-UNIQUE' : 'UNIQUE'}): ${i.columns}`));
  }

  await conn.end();
})();
