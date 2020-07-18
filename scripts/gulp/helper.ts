import through2 = require('through2')
import { promisify } from 'util'
import type { Configuration } from 'webpack'
import webpack = require('webpack')
import type { TaskFunction } from 'gulp'
import ts = require('typescript')
import { getEnvironment } from './env'

export function modifyFile(fn: (x: string) => string) {
    return through2.obj((file, _, cb) => {
        const contents = fn(String(file.contents)) || file.contents

        if (file.isBuffer() === true) {
            file.contents = Buffer.from(contents, 'utf-8')
        }

        cb(null, file)
    })
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
        plugins: [
            new webpack.EnvironmentPlugin(getEnvironment(mode)),
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
        ],
        devtool: isDev ? 'cheap-source-map' : false,
        optimization: { splitChunks: false, minimize: false, runtimeChunk: false },
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
                            importsNotUsedAsValues: 'remove',
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
        if (p.hasErrors()) {
            throw p.compilation.errors.join('\n')
        }
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
