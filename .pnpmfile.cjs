// !!! 1. Be responsible.
// !!! 2. Open a new issue to the library author.
// !!! 3. Add a pnpm/resolution in package.json if the package specifier does not include git hash to pin the version.

/* cspell:disable */
/** @type {Map<string, RegExp | string | (string | RegExp)[]>} */
const approvedList = new Map()

approvedList.set('webpack', [
    'Jack-Works/webpack#lazy-import',
    'Jack-Works/webpack#528c91e564d5756e21c9c462b607d913452af770',
])

approvedList.set('@types/react', ['npm:types-react@beta'])
approvedList.set('@types/react-dom', ['npm:types-react-dom@beta'])

// glob -> jackspeak -> @isaacs/cliui -> ...
approvedList.set('string-width-cjs', 'npm:string-width@^4.2.0')
approvedList.set('strip-ansi-cjs', 'npm:strip-ansi@^6.0.1')
approvedList.set('wrap-ansi-cjs', ['npm:wrap-ansi@^6.0.1', 'npm:wrap-ansi@^7.0.0'])

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
