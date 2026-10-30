import nextEnv from '@next/env'
import pg from 'pg'
import { readFile } from 'node:fs/promises'
nextEnv.loadEnvConfig(process.cwd())
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in .env.local first.')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 })
const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query('SELECT pg_advisory_xact_lock(7482941)')
  await client.query(await readFile(new URL('../db/schema.sql', import.meta.url),'utf8'))
  await client.query('COMMIT')
  console.log('Local PostgreSQL schema is ready (version 2).')
} catch(e) { await client.query('ROLLBACK'); throw e }
finally { client.release(); await pool.end() }
