import { createRequire } from 'module'
import { readFile, writeFile } from 'fs/promises'
const require = createRequire(import.meta.url)
const files = await Promise.all(
    [
        require.resolve('gun/gun.js'),
        require.resolve('gun/sea'),
        require.resolve('gun/lib/radix'),
        // cspell: disable-next-line
        require.resolve('gun/lib/radisk'),
        require.resolve('gun/lib/store'),
        // cspell: disable-next-line
        require.resolve('gun/lib/rindexed'),
    ].map((path) => readFile(path, 'utf8')),
)
function init() {
    'use strict'
    // This log is required by Gun's license.
    globalThis.console.log(
        'Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!',
    )
    function setTimeout() {
        return globalThis.setTimeout.apply(globalThis, arguments)
    }
    const location = new URL('https://example.com')
    const Object = {
        prototype: globalThis.Object.prototype,
        keys: globalThis.Object.keys,
        create: globalThis.Object.create,
        assign: globalThis.Object.assign,
    }
    const console = { log() {} }
    const JSON = { parse: globalThis.JSON.parse, stringify: globalThis.JSON.stringify }
    function String() {
        return globalThis.String.apply(this, arguments)
    }
    String.fromCharCode = globalThis.String.fromCharCode
    String.fromCodePoint = globalThis.String.fromCodePoint
    const window = {
        setTimeout,
        location,
        Object,
        console,
        String,
        JSON,
        TextEncoder: globalThis.TextEncoder,
        TextDecoder: globalThis.TextDecoder,
        crypto: globalThis.crypto,
        get localStorage() {
            return globalThis.localStorage
        },
        get sessionStorage() {
            return globalThis.sessionStorage
        },
        indexedDB: globalThis.indexedDB,
    }
    try {
        // Source Code Here
    } finally {
        return window
    }
}

const patchedSource = files
    .join('\n;')
    // patch .constructor != Object to .constructor == globalThis.Object
    .replace(/!==?\s+Object/g, '!== globalThis.Object')
    .replace(/===?\s+Object/g, '=== globalThis.Object')
    // patch instanceof Object to instanceof globalThis.Object
    .replace(/instanceof\s+Object/g, 'instanceof globalThis.Object')

const result = `(() => {
${init.toString().replace('// Source Code Here', patchedSource)};
if (!globalThis.Gun) {
    globalThis.Gun = ${init.name}().Gun;
}
})();
undefined;
`
writeFile(new URL('./gun.js', import.meta.url), result)
