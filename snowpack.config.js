const packageJSON = require('./package.json')
const external = []
//['react', 'react-dom', 'elliptic']
const usingNodeJSModules = ['node-stego', 'wallet.ts', 'web3']
const banList = [
    'husky',
    'matrix-js-sdk-type',
    'webextension-polyfill',
    '@magic-works/webextension-systemjs',
    'web-ext-types',
    'elliptic',
    /** need tree shake */ 'lodash-es',
    /** remove this when switch back to official version */ 'swr',
    ...usingNodeJSModules,
    ...external,
]
const extraList = []
module.exports = {
    exclude: ['**/*'],
    knownEntrypoints: ban(Object.keys(packageJSON.dependencies)).concat(extraList),
    installOptions: {
        externalPackage: external,
    },
}
/**
 * @param {string[]} list
 */
function ban(list) {
    return list.filter((x) => {
        if (x.startsWith('@types')) return false
        if (banList.includes(x)) return false
        if (x.includes('material-ui')) return false
        return true
    })
}
