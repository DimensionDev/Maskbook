import { promisify } from 'util'
import type { Configuration } from 'webpack'
import webpack from 'webpack'
import { dest, lastRun, series, src, TaskFunction, watch } from 'gulp'
import ts from 'typescript'
import { buildArchitecture, buildTarget, getEnvironment, silent } from './env'
import { Readable, Transform } from 'stream'
import changed from 'gulp-changed'
import Listr from 'listr'
import { spawn } from 'child_process'

export function modifyFile(fn: (x: string) => string) {
    const stream = new Transform({
        objectMode: true,
        transform(file, _enc, callback) {
            if (!file.isBuffer()) return callback(null, file)
            const text = fn(String(file.contents)) || file.contents
            // un-typed API?
            file.contents = (Readable as any).from(text)
            return callback(null, file)
        },
    })
    return stream
}

export function getWebpackConfig(
    mode: Configuration['mode'],
    entry: Configuration['entry'],
    distPath: string,
): Configuration {
    const isDev = mode === 'development'
    const needCompress = !isDev && buildTarget === 'firefox' && buildArchitecture === 'web'
    return {
        mode,
        entry,
        plugins: [new webpack.EnvironmentPlugin(getEnvironment(mode))],
        devtool: isDev ? 'cheap-source-map' : false,
        optimization: {
            minimize: needCompress,
            namedModules: true,
            namedChunks: true,
            runtimeChunk: false,
            splitChunks: {
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1108199#c2
                automaticNameDelimiter: '-',
            },
        },
        output: {
            path: distPath,
            globalObject: 'globalThis',
        },
        externals: [{}],
        watch: isDev,
        resolve: { extensions: ['.js', '.ts', '.tsx', '.json'] },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    use: ['source-map-loader'],
                },
                { parser: { requireEnsure: false } },
                {
                    test: /\.(ts|tsx)$/,
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        compilerOptions: {
                            noEmit: false,
                            importsNotUsedAsValues: 'preserve',
                            removeComments: true,
                        },
                    },
                },
            ],
        },
    }
}
export function buildWebpackTask(name: string, desc: string, config: (mode: Configuration['mode']) => Configuration) {
    const build: TaskFunction = async () => {
        const f = webpack(config('production'))
        const p: webpack.Stats = await promisify(f.run.bind(f))()
        const log = p.toString({ warningsFilter: (x) => !!x.match(/source map/) })
        if (p.hasErrors()) {
            throw new Error(log)
        }
        if (!silent) console.log(log)
    }
    build.displayName = name
    build.description = `${desc} (build)`

    const watch: TaskFunction = () => {
        webpack(config('development')).watch({}, (handler, stats) => {})
    }
    watch.displayName = `watch-${name}`
    watch.description = `${desc} (watch)`
    return [build, watch] as const
}
export function createTask(name: string, desc: string, f: (mode: Configuration['mode']) => TaskFunction) {
    return [
        named(name, `${desc} (build)`, f('production')),
        named(`watch-${name}`, `${desc} (watch)`, f('development')),
    ] as const
}
export function named<T extends TaskFunction>(
    displayName: string,
    desc: string,
    f: T,
): T & { displayName: string; description: string } {
    f.displayName = displayName
    f.description = desc
    return f as any
}
export function toSystem(x: string) {
    return ts.transpileModule(x, {
        compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.System,
        },
    }).outputText
}
export function copyOnChange(opts: {
    name: string
    desc: string
    from: Parameters<typeof src>
    to: string
    watch: Parameters<typeof watch>
    transform?: (s: NodeJS.ReadWriteStream) => NodeJS.ReadWriteStream
}) {
    const { desc, name, from, to, watch: watchProps, transform } = opts
    function copy() {
        let s = src(from[0], { since: lastRun(copy), ...from[1] })
        if (transform) s = transform(s)
        return s.pipe(changed(to)).pipe(dest(to))
    }
    named(name, desc + ' (build)', copy)
    const watchCopy = named('watch-' + name, desc + ' (watch)', () =>
        watch(watchProps[0], { ignoreInitial: false, ...watchProps[1] }, copy),
    )
    return [copy, watchCopy] as const
}
function toListR(f: TaskFunction | Listr, opt?: Partial<Listr.ListrTask>): Listr.ListrTask {
    if (f instanceof Listr) {
        return { task: () => f, title: (f as any).title || 'Parallel tasks', ...opt }
    }
    return {
        title: f.description || f.name || 'Untitled task',
        task: () => promisify(series(f))(),
        ...opt,
    }
}
export function seriesL(title: string, ...f: (TaskFunction | Listr | Listr.ListrTask)[]) {
    const t = new Listr(f.map((x) => (isTask(x) ? x : toListR(x))))
    // @ts-ignore
    t.title = title || `(Series tasks of ${f.map((x) => x.displayName || x.title || x.name).join(', ')})`
    return t
}
export function parallelL(title: string, ...f: (TaskFunction | Listr | Listr.ListrTask)[]) {
    const t = new Listr(
        f.map((x) => (isTask(x) ? x : toListR(x))),
        { concurrent: true },
    )
    // @ts-ignore
    t.title = title || `(Parallel tasks of ${f.map((x) => x.displayName || x.title || x.name).join(', ')})`
    return t
}
function isTask(o: TaskFunction | Listr | Listr.ListrTask): o is Listr.ListrTask {
    if (typeof o === 'function') return false
    if (o instanceof Listr) return false
    return true
}
export function multiProcess(tasks: TaskFunction[]) {
    const createWorker = function (taskName: TaskFunction) {
        return new Promise<void>((resolve, reject) => {
            if (!taskName.displayName) throw new Error('Please set displayName on the task')
            const args = process.execArgv.concat([process.argv[1], taskName.displayName!])
            let possible = true
            process.argv.slice(2).forEach((val) => {
                if (!possible) args.push(val)
                if (val[0] === '-' && val !== '--gulpfile') args.push(val)
                else possible = false
            })
            const worker = spawn(process.execPath, args, { stdio: 'inherit' })
            worker.on('exit', resolve)
            worker.on('error', reject)
        })
    }
    const t = new Listr(
        tasks.map((x) => ({ title: x.description! || x.displayName!, task: createWorker.bind(null, x) })),
        { concurrent: true },
    )
    // @ts-ignore
    t.title = `(Multi process of ${tasks.map((x) => x.displayName).join(', ')})`
    return t
}
