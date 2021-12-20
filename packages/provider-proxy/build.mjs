// @ts-check
import { build } from 'esbuild'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdir } from 'fs/promises'

// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url))
const externals = [
    // @ts-ignore
    ...new Set((await readdir(join(__dirname, '../../node_modules/.pnpm'))).map(resolvePackageName)),
].filter(isExternal)

// @ts-ignore
const result = await build({
    absWorkingDir: __dirname,
    bundle: true,
    entryPoints: [join(__dirname, './src/index.ts')],
    treeShaking: true,
    outfile: join(__dirname, './dist/out.js'),
    platform: 'node',
    external: externals.concat('electron'),
    format: 'esm',
    // minify: true,
    plugins: [
        {
            name: 'everything-side-effect-free',
            setup: (build) => {
                build.onResolve({ filter: /.*/ }, (args) => {
                    // if (
                    //     !args.path.startsWith('.') &&
                    //     (args.kind === 'import-statement' || args.kind === 'require-call')
                    // ) {
                    //     console.log(`[${args.importer}] import '${args.path}'`)
                    //     if (args.path.startsWith('@masknet/')) {
                    //         return { external: false, sideEffects: false }
                    //     }
                    //     return {
                    //         external: true,
                    //         sideEffects: false,
                    //     }
                    // }
                    return { sideEffects: false }
                })
            },
        },
    ],
})

/** @param pkg {string} */
function resolvePackageName(pkg) {
    if (pkg.startsWith('@')) {
        return `@` + pkg.slice(1).split('@')[0].replace('+', '/')
    }
    return pkg.split('@')[0]
}
/** @param pkg {string} */
function isExternal(pkg) {
    // Monorepo packages
    if (pkg.startsWith('@masknet')) return false
    // Some of @dimensiondev packages are published on the Github registry which is not convenient to use.
    if (pkg.startsWith('@dimensiondev')) return false
    return true
}
