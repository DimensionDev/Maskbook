const { spawn } = require('child_process')

process.on('unhandledRejection', e => {
    process.exit(1)
})

function spawnAsync(command, args, options) {
    const child = spawn(command, args, { stdio: 'inherit', shell: true, ...options })
    return new Promise(function(resolve, reject) {
        const error = code => {
            return reject(new Error('Child exited with code: ' + code))
        }
        child.addListener('error', e => {
            child.kill()
            reject(e)
        })
        child.addListener('exit', code => (code === 0 ? resolve : error)(code))
    })
}

module.exports = {
    spawn: spawnAsync,
}
