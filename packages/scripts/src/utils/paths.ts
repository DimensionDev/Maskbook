import { resolve } from 'path'

export const ROOT_PATH = resolve(__dirname, '../../../../')
export const PKG_PATH = resolve(ROOT_PATH, 'packages')
export const BUILD_PATH = resolve(ROOT_PATH, 'build')
export const NETLIFY_PATH = resolve(PKG_PATH, 'netlify')
export const EXTENSION_SOURCE = resolve(PKG_PATH, 'mask', 'src')
