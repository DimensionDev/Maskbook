const { spawn } = require('./spawn')
const path = require('path')
const argv = require('yargs').argv

const base = path.join(__dirname, '../')
process.chdir(base)

const reportOnly = argv.reportOnly

;(async () => {
  await spawn('eslint', ['--ignore-path', '.prettierignore', '--ext', 'tsx,ts,jsx,js', './src/', ...reportOnly ? [] : ['--cache', '--fix'] ])
  await spawn('prettier', ['./src/**/*.{ts,tsx}', ...reportOnly ? [ '--check', '--loglevel', 'log'] : ['--write', '--loglevel', 'warn'] ])
})()
