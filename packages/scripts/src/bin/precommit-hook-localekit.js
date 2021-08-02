const { spawnSync } = require('child_process')
const { resolve } = require('path')

spawnSync('npx', ['gulp', 'locale-kit', '--sync-keys', '--remove-unused-keys'], {
    cwd: resolve(__dirname, '../../../../'),
    stdio: 'inherit',
    shell: true,
})
