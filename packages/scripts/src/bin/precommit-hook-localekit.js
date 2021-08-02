const { spawnSync } = require('child_process')
const { resolve } = require('path')

const { status, error } = spawnSync('npx', ['gulp', 'locale-kit', '--sync-keys', '--remove-unused-keys'], {
    cwd: resolve(__dirname, '../../../../'),
    stdio: 'inherit',
    shell: true,
})
if (error) {
    console.error(error)
}
process.exit(status === null || status === 0 ? 0 : status)
