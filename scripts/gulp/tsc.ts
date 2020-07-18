import { dest, lastRun, src, watch } from 'gulp'
import { spawn } from 'child_process'
import { output, srcPath, tsconfigESMPath } from './paths'
import { modifyFile, named, toSystem } from './helper'
import { join } from 'path'
const typescriptCLI = join(require.resolve('ttypescript'), '../tsc.js')
// @ts-ignore
console.log(typescriptCLI, tsconfigESMPath.file)

const tsc = (watch: boolean) => () =>
    spawn('node', [typescriptCLI, '--preserveWatchOutput', '-p', tsconfigESMPath.file, watch ? ' -w' : ''], {
        stdio: 'inherit',
        cwd: srcPath.relative('../'),
        shell: true,
    })
export const tscESModuleWatch = named('watch-esm', tsc(true), 'Build all TypeScript into browser ES Module (watch)')
export const tscESModuleBuild = named('esm', tsc(false), 'Build all TypeScript into browser ES Module (build)')
export const tscSystemBuild = named(
    'system',
    () =>
        src(output.esmBuild.files, { since: lastRun(tscSystemBuild) })
            .pipe(modifyFile((x) => toSystem(x).replace('ttsclib.js', 'ttsclib-system.js')))
            .pipe(dest(output.systemBuild.folder)),
    'Build all TypeScript into SystemJS format for Firefox (build)',
)
export const tscSystemWatch = named(
    'watch-system',
    () => watch(output.esmBuild.folder, { ignoreInitial: false }, tscSystemBuild),
    'Build all TypeScript into SystemJS format for Firefox (watch)',
)
