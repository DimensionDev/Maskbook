import { PKG_PATH, ROOT_PATH } from '../utils/index.js'
import { fileURLToPath } from 'url'

const DIST_PATH = new URL('dist/cloudflare', ROOT_PATH)

export const buildCloudflare = function copyLocalesJSON() {
    return src('**/locale/*.json', {
        cwd: fileURLToPath(PKG_PATH),
        ignore: ['**/node_modules/**', '**/dist/**'],
    }).pipe(dest(fileURLToPath(DIST_PATH)))
}
