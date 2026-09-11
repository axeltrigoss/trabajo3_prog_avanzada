import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
})

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conectado a Postgres'))
  .catch((err) => console.error('❌ No se pudo conectar a Postgres:', err.message))
