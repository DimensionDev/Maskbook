// !!! There is some relative path installation source in the dependency tree,
// !!! but if we do not allow those packages to run install scripts anyway, it might be safe.
// !!! If we can resolve 'link:../empty' to something like 'workspaceRoot:/projects/empty', it will be safe to install.
/** @type {Map<string, string | string[]>} */
// @ts-expect-error
const approvedList = new Map([
    // opensea-js https://github.com/ProjectOpenSea/opensea-js/issues/407
    [
        'ethereumjs-abi',
        [
            'git+https://github.com/ProjectWyvern/ethereumjs-abi.git',
            'git+https://github.com/ethereumjs/ethereumjs-abi.git',
            'https://github.com/ProjectWyvern/ethereumjs-abi.git',
        ],
    ],
    ['wyvern-js', ['git+https://github.com/ProjectOpenSea/wyvern-js.git#josh/package-lock-npm']],
    ['wyvern-schemas', ['git+https://github.com/ProjectOpenSea/wyvern-schemas.git#josh/package-lock-npm2']],
    /* cspell:disable-next-line */
    ['async-eventemitter', 'github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c'],
    // opensea-js (v1), (and more, run `pnpm -r why web3@0.20.7`) -> web3
    ['bignumber.js', 'git+https://github.com/frozeman/bignumber.js-nolookahead.git'],

    // https://github.com/i18next/i18next-translation-parser/issues/11
    // @magic-works/i18n-codegen -> i18next-translation-parser
    /* cspell:disable-next-line */
    ['html-parse-stringify2', 'github:locize/html-parse-stringify2'],

    // ipfs https://github.com/ipfs/js-ipfs-utils/issues/158
    ['node-fetch', 'https://registry.npmjs.org/@achingbrain/node-fetch/-/node-fetch-2.6.7.tgz'],
])

/**
 * @param {string} parentPackage The current resolving parentPackage
 * @param {string} dependedPackage The package it depends on
 * @param {string} installationSource An unusual installation source (e.g. git: https: or link:)
 */
function assertInstallationSourceValid(parentPackage, dependedPackage, installationSource) {
    if (approvedList.has(dependedPackage)) {
        const source = approvedList.get(dependedPackage)
        if (source === installationSource) return
        if (Array.isArray(source) && source.indexOf(installationSource) !== -1) return
    }

    if (dependedPackage === 'lodash-es' && installationSource.startsWith('npm:lodash@^4')) return

    // !!! Relative path
    if (installationSource === 'link:../empty' || installationSource === 'link:..\\empty') return
    if (installationSource === '../empty' || installationSource === '..\\empty') return

    throw new Error(
        `Unapproved dependency source:
    Package: ${dependedPackage}
    Source: ${installationSource}
    Declared by: ${parentPackage}`,
    )
}

function validatePackage({ dependencies, devDependencies, optionalDependencies, peerDependencies, name }) {
    for (const [k, v] of notNormativeInstall(dependencies)) assertInstallationSourceValid(name, k, v)
    // devDependencies won't be installed for intermediate dependencies
    // for (const [k, v] of notNormativeInstall(devDependencies)) assertInstallationSourceValid(name, k, v)
    for (const [k, v] of notNormativeInstall(optionalDependencies)) assertInstallationSourceValid(name, k, v)
    for (const [k, v] of notNormativeInstall(peerDependencies)) assertInstallationSourceValid(name, k, v)
}

function lockPackage(pkg) {
    if (pkg.name === 'opensea-js') {
        const prefix = 'git+https://github.com/ProjectOpenSea/wyvern-'
        pkg.dependencies['wyvern-js'] = `${prefix}js.git#a106e07cc5974ca295d25cf9be6f78e61b54d380`
        pkg.dependencies['wyvern-schemas'] = `${prefix}schemas.git#db45776f81586494e036fe7f23abc63be3abc9c2`
    }
}

function readPackage(pkg, context) {
    validatePackage(pkg)
    lockPackage(pkg)
    return pkg
}

module.exports = {
    hooks: {
        readPackage,
    },
}

function* notNormativeInstall(deps) {
    for (const key in deps) {
        const val = deps[key]
        if (val.startsWith('workspace:')) continue
        if (val.includes(':') || val.includes('/')) {
            yield [key, val]
        }
    }
}
