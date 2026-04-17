import { cpSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const src = resolve(root, 'node_modules/cesium/Build/Cesium')
const dest = resolve(root, 'public/cesium')

mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })

console.log('✅ Cesium static assets copied to public/cesium')
