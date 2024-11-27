import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import virtual from '@rollup/plugin-virtual'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import { swc, minify } from 'rollup-plugin-swc3'

const require = createRequire(import.meta.url)
const compat = require('core-js-compat/compat')
const { list } = compat({
    targets: ['Chrome 115', 'last 1 Firefox versions', 'last 1 Safari versions'],
    modules: ['core-js/stable'],
})

const ecmascriptPolyfill = list
    .map((item) => `core-js/modules/${item}.js`)
    .concat('./runtime/transpiler.js')
    .map((x) => `import '${x}'\n`)
    .join('')
export default defineConfig([
    {
        input: 'entry',
        output: {
            file: 'dist/ecmascript.js',
            format: 'es',
            generatedCode: 'es2015',
            banner: `/**
 * @license
 * This file includes the following runtime/polyfills.
 * core-js:
${list.map((x) => ` *     ${x}`).join('\n')}
 * regenerator-runtime
 * tslib
 * reflect-metadata
 */
if (!globalThis[Symbol.for('mask_init_polyfill')]) return;
globalThis[Symbol.for('mask_init_polyfill')] = true;
`.trim(),
        },
        plugins: [
            (virtual.default || virtual)({
                entry: ecmascriptPolyfill,
            }),
            ...plugins(),
        ],
    },
    {
        input: fileURLToPath(import.meta.resolve('./web-apis/index.ts')),
        output: {
            file: 'dist/dom.js',
            format: 'iife',
            generatedCode: 'es2015',
        },
        plugins: plugins(),
    },
    {
        input: fileURLToPath(import.meta.resolve('./web-apis/worker.ts')),
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
        (commonjs.default || commonjs)(),
        (json.default || json)(),
        swc({
            tsconfig: './tsconfig.json',
            jsc: { target: 'es2022' },
        }),
        minify({ compress: false, mangle: false }),
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
