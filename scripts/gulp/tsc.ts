import { dest, lastRun, src, watch } from 'gulp'
import { spawn } from 'child_process'
import { output, srcPath, tsconfigESMPath } from './paths'
import { createTask, modifyFile, named, toSystem } from './helper'
import { join } from 'path'

const typescriptCLI = join(require.resolve('ttypescript'), '../tsc.js')
export const { build: tscESModuleBuild, watch: tscESModuleWatch } = createTask(
    'esm',
    'Build all TypeScript into browser ES Module',
    (mode) => () =>
        spawn(
            'node',
            [typescriptCLI, '--preserveWatchOutput', '-p', tsconfigESMPath.file, mode === 'development' ? ' -w' : ''],
            {
                stdio: 'inherit',
                cwd: srcPath.relative('../'),
                shell: true,
            },
        ),
)
export const tscSystemBuild = named('system', 'Build all TypeScript into SystemJS format for Firefox (build)', () =>
    src(output.esmBuild.files, { since: lastRun(tscSystemBuild) })
        .pipe(modifyFile((x) => toSystem(x).replace('ttsclib.js', 'ttsclib-system.js')))
        .pipe(dest(output.systemBuild.folder)),
)
export const tscSystemWatch = named(
    'watch-system',
    'Build all TypeScript into SystemJS format for Firefox (watch)',
    () => watch(output.esmBuild.folder, { ignoreInitial: false }, tscSystemBuild),
)
