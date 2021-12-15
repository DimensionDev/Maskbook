// !!! There is some relative path installation source in the dependency tree,
// !!! but if we do not allow those packages to run install scripts anyway, it might be safe.
// !!! If we can resolve 'link:../empty' to something like 'workspaceRoot:/projects/empty', it will be safe to install.
const approvedList = new Map([
    [
        'ethereumjs-abi',
        [
            'git+https://github.com/ProjectWyvern/ethereumjs-abi.git',
            'git+https://github.com/ethereumjs/ethereumjs-abi.git',
            'https://github.com/ProjectWyvern/ethereumjs-abi.git',
        ],
    ],
    [
        'wyvern-js',
        ['git+https://github.com/ProjectOpenSea/wyvern-js.git#v3.2.1', 'github:ProjectOpenSea/wyvern-js#semver:^3.2.1'],
    ],
    ['wyvern-schemas', 'git+https://github.com/ProjectOpenSea/wyvern-schemas.git#v0.11.1'],
    ['bignumber.js', 'git+https://github.com/frozeman/bignumber.js-nolookahead.git'],
    /* cspell:disable-next-line */
    ['html-parse-stringify2', 'github:locize/html-parse-stringify2'],
    /* cspell:disable-next-line */
    ['async-eventemitter', 'github:ahultgren/async-eventemitter#fa06e39e56786ba541c180061dbf2c0a5bbf951c'],
    // !!! Relative path
    ['xhr2-cookies', 'link:./package-overrides/xhr2-cookies'],
    ['node-fetch', 'https://registry.npmjs.org/@achingbrain/node-fetch/-/node-fetch-2.6.7.tgz']
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
