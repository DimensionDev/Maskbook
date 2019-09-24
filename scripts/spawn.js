const { spawn } = require('child_process')

process.on('unhandledRejection', e => {
    process.exit(1)
})
/**
 *
 * @param {string} command Command
 * @param {string[]} args Arguments
 * @param {import('child_process').SpawnOptionsWithoutStdio} options Options
 */
function spawnAsync(command, args, options = {}) {
    const child = spawn(command, args, { stdio: 'inherit', shell: true, ...options })
    let stdout = ''
    if (child.stdout) {
        child.stdout.addListener('data', data => (stdout += data.toString()))
    }
    return new Promise(function(resolve, reject) {
        child.addListener('error', e => {
            child.kill()
            reject(e)
        })
        child.addListener('exit', code => {
            if (code === 0) return resolve(stdout)
            const error = new Error('Child exited with code: ' + code)
            // @ts-ignore
            error.stdout = stdout
            reject(error)
        })
    })
}

module.exports = {
    spawn: spawnAsync,
}
