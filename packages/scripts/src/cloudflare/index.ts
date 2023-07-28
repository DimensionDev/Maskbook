import { dest, parallel, series, src, type TaskFunction } from 'gulp'
import { awaitChildProcess, PKG_PATH, ROOT_PATH, shell, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'
import { fileURLToPath } from 'url'

const DIST_PATH = new URL('dist/cloudflare', ROOT_PATH)
function buildApp() {
    return awaitChildProcess(shell.cwd(new URL('app', PKG_PATH))`pnpm run build:ci`)
}

function copyLocalesJSON() {
    return src('**/locales/*.json', {
        cwd: fileURLToPath(PKG_PATH),
        ignore: ['**/node_modules/**', '**/dist/**'],
    }).pipe(dest(fileURLToPath(DIST_PATH)))
}
export const buildCloudflare: TaskFunction = series(codegen, parallel(copyLocalesJSON, buildApp))
task(buildCloudflare, 'build-ci-cloudflare', 'Build for Cloudflare')
