#!/usr/bin/env node
/**
 * Batch-convert PNG/JPEG assets under public/images to WebP (Locashun-style).
 *
 * Usage:
 *   npm run images:webp              # convert missing webp only
 *   npm run images:webp -- --force   # overwrite existing webp
 *   npm run images:webp -- --dry-run
 */

import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const SCAN_ROOTS = [path.join(ROOT, 'public/images')]

const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg'])
const QUALITY = 85

const args = process.argv.slice(2)
const force = args.includes('--force')
const dryRun = args.includes('--dry-run')

async function walk(dir) {
  /** @type {string[]} */
  const files = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (entry.isFile()) {
      files.push(full)
    }
  }
  return files
}

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('Missing dependency: run `npm install` (sharp is a devDependency).')
    process.exit(1)
  }

  const allFiles = []
  for (const root of SCAN_ROOTS) {
    allFiles.push(...(await walk(root)))
  }

  const sources = allFiles.filter((f) => {
    const base = path.basename(f)
    if (base.startsWith('._') || base.startsWith('.')) return false
    return SOURCE_EXT.has(path.extname(f).toLowerCase())
  })

  if (!sources.length) {
    console.log('No PNG/JPEG files found under public/images.')
    return
  }

  let converted = 0
  let skipped = 0
  let savedBytes = 0

  for (const src of sources) {
    const dest = src.replace(/\.(png|jpe?g)$/i, '.webp')
    if (!force) {
      try {
        await stat(dest)
        skipped += 1
        continue
      } catch {
        /* no webp yet */
      }
    }

    if (dryRun) {
      console.log(`[dry-run] ${path.relative(ROOT, src)} → ${path.relative(ROOT, dest)}`)
      converted += 1
      continue
    }

    const before = (await stat(src)).size
    await sharp(src).webp({ quality: QUALITY, effort: 4 }).toFile(dest)
    const after = (await stat(dest)).size
    savedBytes += Math.max(0, before - after)
    converted += 1
    const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0
    console.log(`${path.relative(ROOT, dest)} (−${pct}%)`)
  }

  console.log('')
  console.log(`Done: ${converted} converted, ${skipped} skipped (webp already exists).`)
  if (!dryRun && savedBytes > 0) {
    console.log(`Approx. saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB vs PNG/JPEG sources.`)
  }
  if (skipped > 0 && !force) {
    console.log('Tip: run with --force to regenerate all webp files.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
