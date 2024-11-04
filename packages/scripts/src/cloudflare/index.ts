import { dest, parallel, series, src, type TaskFunction } from 'gulp'
import { PKG_PATH, ROOT_PATH, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'
import { fileURLToPath } from 'url'

const DIST_PATH = new URL('dist/cloudflare', ROOT_PATH)

function copyLocalesJSON() {
    return src('**/locale/*.json', {
        cwd: fileURLToPath(PKG_PATH),
        ignore: ['**/node_modules/**', '**/dist/**'],
    }).pipe(dest(fileURLToPath(DIST_PATH)))
}
export const buildCloudflare: TaskFunction = series(codegen, parallel(copyLocalesJSON))
task(buildCloudflare, 'build-ci-cloudflare', 'Build for Cloudflare')
