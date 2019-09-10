const { spawn } = require('./spawn')
const path = require('path')
const argv = require('yargs').argv

const base = path.join(__dirname, '../')
process.chdir(base)

const reportOnly = argv.reportOnly

;(async () => {
    !argv.noEslint ? await spawn('eslint', [
        '--ignore-path',
        '.prettierignore',
        '--ext',
        'tsx,ts,jsx,js',
        './src/',
        ...(reportOnly ? [] : ['--cache', '--fix']),
    ]) : null
    !argv.noPrettier ? await spawn('prettier', [
        './src/**/*.{ts,tsx,jsx,js}',
        ...(reportOnly ? ['--check', '--loglevel', 'log'] : ['--write', '--loglevel', 'warn']),
    ]) : null
})()
