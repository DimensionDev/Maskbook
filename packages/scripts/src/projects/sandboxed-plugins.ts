import { Transform, TransformCallback } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { createRequire } from 'node:module'
import { ensureDir } from 'fs-extra'
import { watchTask } from '../utils/task.js'
import { PKG_PATH, ROOT_PATH } from '../utils/paths.js'
import { parseJSONc } from '../utils/jsonc.js'
import { transform } from '@swc/core'
import { dest, lastRun, series, src, TaskFunction } from 'gulp'

const require = createRequire(new URL(import.meta.url))
const sandboxedPlugins = new URL('./sandboxed-plugins/', PKG_PATH)
const sandboxedPluginsDist = fileURLToPath(new URL('./dist', sandboxedPlugins))

export function watchSandboxedPlugin() {}
export async function buildSandboxedPlugin() {
    await ensureDistFolder()
    const { dev, prod } = await readCombinedPluginList()

    const builders = new Map<string, TaskFunction>()
    for (const spec of prod.concat(dev)) {
        const manifestPath = resolveManifestPath(spec)
        if (builders.has(manifestPath)) {
            throw new TypeError(`Multiple specifier points to the same manifest file. ${manifestPath}`)
        }
        if (prod.includes(spec) && relative(fileURLToPath(ROOT_PATH), manifestPath).startsWith('..')) {
            throw new TypeError(`${manifestPath} is not in the repo. Use plugins-local.json instead.`)
        }
        const json = await readFile(manifestPath, 'utf8').then(parseJSONc)
        if (!json.id) throw new TypeError(`${manifestPath} does not contain an id.`)
        builders.set(
            manifestPath,
            createBuilder(
                json.id,
                manifestPath.slice(0, -'/mask-manifest.json'.length),
                prod.includes(spec) ? 'prod-' : 'dev-',
            ),
        )
    }
    await new Promise((resolve) => series(...builders.values())(resolve))
}
watchTask(buildSandboxedPlugin, watchSandboxedPlugin, 'sbp', 'Build sandboxed plugins')

function createBuilder(id: string, manifestRoot: string, prefix: 'prod-' | 'dev-') {
    if (id.includes('..') || id.includes('/')) throw new TypeError(`Invalid plugin: ${id}`)
    function compile() {
        return src(['./**/*'], {
            since: lastRun(compile),
            cwd: manifestRoot,
        })
            .pipe(new TransformStream(id))
            .pipe(dest(prefix + id, { cwd: sandboxedPluginsDist }))
    }
    return compile
}
function ensureDistFolder() {
    return ensureDir(sandboxedPluginsDist)
}

async function readCombinedPluginList() {
    const prodURL = new URL('./plugins.json', sandboxedPlugins)
    const localURL = new URL('./plugins-local.json', sandboxedPlugins)

    const prod = await readFile(prodURL, 'utf8').then(parseJSONc)
    const dev = await readFile(localURL, 'utf8')
        .then(parseJSONc)
        .catch(() => [])

    assertShape(prod, prodURL)
    assertShape(dev, localURL)
    return { prod, dev }
}

function assertShape(data: unknown, file: URL): asserts data is string[] {
    if (!Array.isArray(data) || data.some((x) => typeof x !== 'string'))
        throw new TypeError(`${file} does not contain an array of string.`)

    for (const spec of data as string[]) {
        if (spec.startsWith('npm:') || spec.startsWith('file:')) continue
        throw new TypeError(`${file} contains an invalid specifier: ${spec}.`)
    }
}

function resolveManifestPath(spec: string) {
    if (spec.startsWith('npm:')) {
        const require = createRequire(sandboxedPlugins)
        return require.resolve(spec.slice(4) + '/mask-manifest.json')
    } else if (spec.startsWith('file:')) {
        const abs = join(fileURLToPath(sandboxedPlugins), spec.slice(5), './mask-manifest.json')
        return abs
    } else {
        throw new TypeError('Unknown specifier')
    }
}
class TransformStream extends Transform {
    constructor(public id: string) {
        super({ objectMode: true, defaultEncoding: 'utf-8' })
    }
    wasm = require.resolve('@masknet/static-module-record-swc')
    override _transform(
        file: { relative: string; contents: any; path: string },
        encoding: BufferEncoding,
        callback: TransformCallback,
    ): void {
        if (!(file.path.endsWith('.js') || file.path.endsWith('.mjs'))) {
            return callback(null, file)
        }
        const sandboxedPath = 'mask-plugin://' + this.id + '/' + file.relative.replace(/\\/g, '/')
        const options = {
            template: {
                type: 'callback',
                callback: '__mask__module__define__',
                firstArg: sandboxedPath,
            },
        }
        transform(file.contents.utf8Slice(), {
            jsc: {
                target: 'es2022',
                experimental: {
                    plugins: [[this.wasm, options]],
                },
            },
        }).then(
            (output) => {
                file.contents = Buffer.from(output.code, 'utf-8')
                if (file.path.endsWith('.mjs')) file.path = file.path.replace(/\.mjs$/, '.js')
                callback(null, file)
            },
            (err) => callback(err),
        )
    }
}
