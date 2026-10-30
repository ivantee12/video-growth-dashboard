import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const compat = new FlatCompat({baseDirectory:dirname(fileURLToPath(import.meta.url)),resolvePluginsRelativeTo:dirname(require.resolve('eslint-config-next'))})
export default [...compat.extends('next/core-web-vitals','next/typescript')]
