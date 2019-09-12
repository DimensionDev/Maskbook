const { spawn } = require('./spawn')
const path = require('path')
const argv = require('yargs').argv

const base = path.join(__dirname, '../')
process.chdir(base)

const reportOnly = argv.reportOnly

;(async () => {
    if (!argv.noEslint)
        await spawn(
            'node',
            [
                // Guess what happens if you don't do this?
                // Path resolution makes a \n, which becomes...
                path.join(base, 'node_modules/eslint/bin/eslint.js'),
                '--ignore-path',
                '.prettierignore',
                '--ext',
                'tsx,ts,jsx,js',
                ...(argv._.length ? argv._ : ['./src/']),
                ...(reportOnly ? [] : ['--cache', '--fix']),
            ],
            { shell: false },
        )
    if (!argv.noPrettier)
        await spawn(
            'node',
            [
                path.join(base, 'node_modules/prettier/bin-prettier.js'),
                ...(argv._.length ? argv._ : ['./**/*.{ts,tsx,jsx,js}']),
                ...(reportOnly ? ['--check', '--loglevel', 'log'] : ['--write', '--loglevel', 'warn']),
            ],
            { shell: false },
        )
})()
