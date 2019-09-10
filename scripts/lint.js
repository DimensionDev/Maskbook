const { spawn } = require('./spawn')
const path = require('path')
const argv = require('yargs').argv

const base = path.join(__dirname, '../')
process.chdir(base)

const reportOnly = argv.reportOnly

;(async () => {
    !argv.noEslint
        ? await spawn('eslint', [
              '--ignore-path',
              '.prettierignore',
              '--ext',
              'tsx,ts,jsx,js',
              ...(argv._.length ? argv._ : ['./src/']),
              ...(reportOnly ? [] : ['--cache', '--fix']),
          ])
        : null
    !argv.noPrettier
        ? await spawn('prettier', [
              ...(argv._.length ? argv._ : ['./**/*.{ts,tsx,jsx,js}']),
              ...(reportOnly ? ['--check', '--loglevel', 'log'] : ['--write', '--loglevel', 'warn']),
          ])
        : null
})()
