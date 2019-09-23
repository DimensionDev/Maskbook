const { spawn } = require('./spawn')
const path = require('path')

const base = path.join(__dirname, '../')
process.chdir(base)
;(async () => {
    if (process.argv.indexOf('--upgrade') !== -1) await spawn('yarn', ['upgrade', '@holoflows/kit'])
    process.chdir('node_modules/@holoflows/kit')
    await spawn('yarn', ['install'])
    try {
        /**
         * For unknown reason, first time build will raise an exception. But if we build it twice, problem will be fixed
         *
         * src/Extension/AutomatedTabTask.ts:119:17 -
         * error TS2742: The inferred type of 'AutomatedTabTask' cannot be named
         * without a reference to '@holoflows/kit/node_modules/csstype'.
         * This is likely not portable.
         * A type annotation is necessary.
         * 119 export function AutomatedTabTask<T extends Record<string, (...args: any[]) => PromiseLike<any>>>(
         *                     ~~~~~~~~~~~~~~~~
         */
        await spawn('yarn', ['build:tsc'])
        await spawn('yarn', ['build:rollup'])
    } catch (e) {
        console.log('Build failed, retry one more time.')
        await spawn('yarn', ['build:tsc'])
        await spawn('yarn', ['build:rollup'])
    }
})()
