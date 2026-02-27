/**
 * Apply the RLS migration to the Supabase project via the Management API.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-rls.mjs
 *
 * Get your Personal Access Token from:
 *   https://app.supabase.com/account/tokens
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_REF = 'zmxpkeibjtolksrvqigr'
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

if (!ACCESS_TOKEN) {
  console.error('\nError: SUPABASE_ACCESS_TOKEN is not set.')
  console.error('Get your PAT from: https://app.supabase.com/account/tokens\n')
  console.error('Then run:')
  console.error('  SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-rls.mjs\n')
  process.exit(1)
}

async function query(sql) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
  return res.json()
}

const sqlPath = join(__dirname, '../supabase/migrations/20260227000000_enable_rls.sql')
const fullSql = readFileSync(sqlPath, 'utf8')

// --- Step 1: check current RLS state ---
console.log('\nChecking current RLS state...')
const rlsCheck = await query(`
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
`)
const tables = rlsCheck.map(r => `  ${r.rowsecurity ? '✓' : '✗'} ${r.tablename}`).join('\n')
console.log(tables)

const allEnabled = rlsCheck.every(r => r.rowsecurity)
if (allEnabled) {
  console.log('\nAll tables already have RLS enabled. Checking policies...')
  const policyCheck = await query(`
    SELECT tablename, count(*) as policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
    ORDER BY tablename
  `)
  policyCheck.forEach(r => console.log(`  ${r.tablename}: ${r.policy_count} policies`))
  console.log('\nMigration already applied. Done.')
  process.exit(0)
}

// --- Step 2: apply migration statement by statement ---
console.log('\nApplying RLS migration...')

// Split on semicolons, skip blank lines and comment-only blocks
const statements = fullSql
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !/^(--|\/\*)/.test(s))

let passed = 0
let skipped = 0
let failed = 0

for (const stmt of statements) {
  const preview = stmt.replace(/\s+/g, ' ').substring(0, 70)
  try {
    await query(stmt)
    console.log(`  ✓ ${preview}`)
    passed++
  } catch (err) {
    const msg = err.message
    // Idempotent errors are fine (policy/column already exists)
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      console.log(`  ~ ${preview} (already exists, skipped)`)
      skipped++
    } else {
      console.error(`  ✗ ${preview}`)
      console.error(`    ${msg}`)
      failed++
    }
  }
}

console.log(`\nDone — ${passed} applied, ${skipped} skipped (already existed), ${failed} failed.`)

if (failed > 0) {
  console.error('\nSome statements failed. Check the output above.')
  process.exit(1)
}

// --- Step 3: verify ---
console.log('\nVerifying RLS state after migration...')
const verify = await query(`
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
`)
verify.forEach(r => console.log(`  ${r.rowsecurity ? '✓' : '✗'} ${r.tablename}`))
