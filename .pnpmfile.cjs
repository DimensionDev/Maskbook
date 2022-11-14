// !!! 1. Be responsible.
// !!! 2. Open a new issue to the library author.
// !!! 3. Add a pnpm/resolution in package.json if the package specifier does not include git hash to pin the version.

/* cspell:disable */
/** @type {Map<string, RegExp | string | (string | RegExp)[]>} */
const approvedList = new Map()

approvedList.set('ethereumjs-abi', [
    // by opensea-js https://github.com/ProjectOpenSea/opensea-js/issues/407
    'git+https://github.com/ProjectWyvern/ethereumjs-abi.git',
    // wyvern-js
    'https://github.com/ProjectWyvern/ethereumjs-abi.git',
    // eth-sig-util
    'git+https://github.com/ethereumjs/ethereumjs-abi.git',
])

approvedList.set('wyvern-js', [
    // by opensea-js https://github.com/ProjectOpenSea/opensea-js/issues/407
    'git+https://github.com/ProjectOpenSea/wyvern-js.git#v3.2.1',
    // wyvern-schemas
    'github:ProjectOpenSea/wyvern-js#semver:^3.2.1',
])

// by opensea-js https://github.com/ProjectOpenSea/opensea-js/issues/407
approvedList.set('wyvern-schemas', 'git+https://github.com/ProjectOpenSea/wyvern-schemas.git#v0.13.1')

// openseajs -> wyvern-schemas -> web3-provider-engine -> eth-block-tracker
approvedList.set('async-eventemitter', 'github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c')

// pnpm -r why web3@0.20.7
approvedList.set('bignumber.js', [
    'git+https://github.com/frozeman/bignumber.js-nolookahead.git',
    'git+https://github.com/frozeman/bignumber.js-nolookahead.git#57692b3ecfc98bbdd6b3a516cb2353652ea49934',
])

// @magic-works/i18n-codegen -> i18next-translation-parser
// https://github.com/i18next/i18next-translation-parser/issues/11
approvedList.set('html-parse-stringify2', [
    'github:locize/html-parse-stringify2',
    'github:locize/html-parse-stringify2#d463109433b2c49c74a081044f54b2a6a1ccad7c',
])

// ipfs https://github.com/ipfs/js-ipfs-utils/issues/158
approvedList.set('node-fetch', 'https://registry.npmjs.org/@achingbrain/node-fetch/-/node-fetch-2.6.7.tgz')

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

    if (dependedPackage === '@typescript/lib-dom' && installationSource.startsWith('npm:@types/web@^')) return

    // !!! There is some relative path installation source in the dependency tree,
    // !!! but if we do not allow those packages to run install scripts anyway, it might be safe.
    // !!! If we can resolve 'link:../empty' to something like 'workspaceRoot:/projects/empty', it will be safe to install.
    if (installationSource === 'link:../empty' || installationSource === 'link:..\\empty') return
    if (installationSource === '../empty' || installationSource === '..\\empty') return

    throw new Error(
        `Unapproved dependency source:
    Package: ${dependedPackage}
    Source: ${installationSource}
    Declared by: ${parentPackage}

    If you want to approve this new unusual dependency, please edit .pnpmfile.cjs.`,
    )
}

/* cspell:enable */

function validatePackage({ dependencies, optionalDependencies, peerDependencies, name, exports }) {
    if (
        exports &&
        !name.startsWith('@dimensiondev') &&
        !name.startsWith('@masknet') &&
        JSON.stringify(exports).includes('mask-src')
    ) {
        throw new Error(
            'A package ' + name + ' out of @dimensiondev or @masknet scope using mask-src in exports field.',
        )
    }
    for (const [k, v] of notNormativeInstall(dependencies)) assertInstallationSourceValid(name, k, v)
    // devDependencies won't be installed for intermediate dependencies
    for (const [k, v] of notNormativeInstall(optionalDependencies)) assertInstallationSourceValid(name, k, v)
    for (const [k, v] of notNormativeInstall(peerDependencies)) assertInstallationSourceValid(name, k, v)
}

function readPackage(pkg, context) {
    validatePackage(pkg)
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
