import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import virtual from '@rollup/plugin-virtual'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import { swc } from 'rollup-plugin-swc3'
import { terser } from 'rollup-plugin-terser'

const require = createRequire(import.meta.url)
const compat = require('core-js-compat/compat')
const { list } = compat({
    targets: ['last 3 Chrome versions', 'last 3 Firefox versions', 'Safari 17'],
    modules: ['core-js/stable'],
})

const ecmascriptPolyfill = list
    .map((item) => require.resolve(`core-js/modules/${item}.js`))
    .concat(require.resolve('./runtime/transpiler.js'))
    .map((x) => `import '${x}'\n`)
    .join('')
console.log(ecmascriptPolyfill)
export default defineConfig([
    {
        input: 'entry',
        output: {
            file: 'dist/ecmascript.js',
            format: 'es',
            generatedCode: 'es2015',
            banner: `
/**
 * @license
 * This file includes the following runtime/polyfills.
 * regenerator-runtime
 * tslib
 * reflect-metadata
 * core-js:
${list.map((x) => ` *     ${x}`).join('\n')}
 */
if (!globalThis[Symbol.for('mask_init_polyfill')]) {
globalThis[Symbol.for('mask_init_polyfill')] = true;
`.trim(),
            footer: `}`,
        },
        plugins: [
            virtual({
                entry: ecmascriptPolyfill,
            }),
            ...plugins(),
        ],
    },
    {
        input: fileURLToPath(new URL('./web-apis/index.ts', import.meta.url)),
        output: {
            file: 'dist/dom.js',
            format: 'iife',
            generatedCode: 'es2015',
        },
        plugins: plugins(),
    },
    {
        input: fileURLToPath(new URL('./web-apis/worker.ts', import.meta.url)),
        output: {
            file: 'dist/worker.js',
            format: 'iife',
            generatedCode: 'es2015',
        },
        plugins: plugins(),
    },
])
function plugins() {
    return [
        nodeResolve(),
        commonjs(),
        json(),
        swc({
            tsconfig: './tsconfig.json',
            jsc: { target: 'es2022' },
        }),
        terser({ mangle: false }),
        wrapperPlugin(),
    ]
}
/**
 * In Firefox, the completion value will be used as the result of the browser.tabs.executeScript,
 * and it will try to report the completion value to the background.
 *
 * If the value is a non-clonable value, it will reject the Promise.
 * By adding a ";null;" in the end to fix this problem.
 *
 * This plugin also wraps the polyfill in an IIFE to avoid variable leaking
 */
function wrapperPlugin() {
    return {
        name: 'wrapper-plugin',
        renderChunk(code) {
            return `
;(() => {
${code}
})();
null;
`
        },
    }
}
