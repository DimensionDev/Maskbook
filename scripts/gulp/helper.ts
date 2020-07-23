import { promisify } from 'util'
import type { Configuration } from 'webpack'
import webpack from 'webpack'
import type { TaskFunction } from 'gulp'
import ts from 'typescript'
import { getEnvironment } from './env'
import { Readable, Transform } from 'stream'

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
    return {
        mode,
        entry,
        plugins: [new webpack.EnvironmentPlugin(getEnvironment(mode))],
        devtool: isDev ? 'cheap-source-map' : false,
        optimization: {
            minimize: false,
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
        console.log(log)
    }
    build.displayName = name
    build.description = `${desc} (build)`

    const watch: TaskFunction = () => {
        webpack(config('development')).watch({}, (handler, stats) => {})
    }
    watch.displayName = `watch-${name}`
    watch.description = `${desc} (watch)`
    return { watch, build }
}
export function createTask(name: string, desc: string, f: (mode: Configuration['mode']) => TaskFunction) {
    return {
        watch: named(`watch-${name}`, `${desc} (watch)`, f('development')),
        build: named(name, `${desc} (build)`, f('production')),
    }
}
export function named(displayName: string, desc: string, f: TaskFunction) {
    f.displayName = displayName
    f.description = desc
    return f
}
export function toSystem(x: string) {
    return ts.transpileModule(x, {
        compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.System,
        },
    }).outputText
}
