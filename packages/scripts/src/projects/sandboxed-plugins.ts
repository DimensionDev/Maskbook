import { Transform, TransformCallback } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, join, relative } from 'node:path'
import { createRequire } from 'node:module'
import { ensureDir } from 'fs-extra'
import { awaitTask, watchTask } from '../utils/task.js'
import { PKG_PATH, ROOT_PATH } from '../utils/paths.js'
import { parseJSONc } from '../utils/jsonc.js'
import { transform } from '@swc/core'
import { dest, lastRun, parallel, src, TaskFunction } from 'gulp'
import { parseArgs } from 'node:util'

const require = createRequire(new URL(import.meta.url))
const sandboxedPlugins = new URL('./sandboxed-plugins/', PKG_PATH)

export async function watchSandboxedPlugin() {
    // TODO: watch mode
    const { out = fileURLToPath(new URL('./dist', ROOT_PATH)) } = parseArgs({
        options: { out: { type: 'string', short: 'o' } },
        allowPositionals: true,
    }).values
    const path = isAbsolute(out) ? out : join(process.cwd(), out)
    await buildSandboxedPluginConfigurable(path, false)
}

export async function buildSandboxedPluginConfigurable(distPath: string, isProduction: boolean) {
    distPath = join(distPath, 'sandboxed-modules/')
    await ensureDir(distPath)
    const { local, formal } = await readCombinedPluginList()

    if (isProduction) local.length = 0

    const mv3PreloadList = new Set<string>()
    const builders = new Map<string, TaskFunction>()
    const id = new Set<string>()
    const localID = new Set<string>()

    for (const spec of formal) {
        const manifestPath = resolveManifestPath(spec)
        if (builders.has(manifestPath)) {
            throw new TypeError(`Multiple specifier points to the same manifest file. ${manifestPath}`)
        }
        if (relative(fileURLToPath(ROOT_PATH), manifestPath).startsWith('..')) {
            throw new TypeError(`${manifestPath} is not in the repo. Please define it in the plugins-local.json.`)
        }
        const json = await readFile(manifestPath, 'utf8').then(parseJSONc)
        if (!json.id) throw new TypeError(`${manifestPath} does not contain an id.`)
        if (id.has(json.id)) throw new TypeError(`Plugin ${json.id} appear twice in the plugins.json.`)
        id.add(json.id)
        builders.set(
            manifestPath,
            createBuilder({
                id: json.id,
                manifestRoot: manifestPath.slice(0, -'/mask-manifest.json'.length),
                distPath,
                prefix: 'plugin-',
                onJS: (id, relative) => mv3PreloadList.add(removeMJSSuffix(`${id}/${relative}`)),
            }),
        )
    }

    for (const spec of local) {
        const manifestPath = resolveManifestPath(spec)
        if (builders.has(manifestPath)) {
            throw new TypeError(`Multiple specifier points to the same manifest file. ${manifestPath}`)
        }
        const json = await readFile(manifestPath, 'utf8').then(parseJSONc)
        if (!json.id) throw new TypeError(`${manifestPath} does not contain an id.`)
        if (localID.has(json.id)) throw new TypeError(`Plugin ${json.id} appear twice in the plugins-local.json.`)
        localID.add(json.id)
        builders.set(
            manifestPath,
            createBuilder({
                id: json.id,
                manifestRoot: manifestPath.slice(0, -'/mask-manifest.json'.length),
                prefix: 'local-plugin-',
                distPath,
                onJS: (id, relative) => mv3PreloadList.add(removeMJSSuffix(`local-${id}/${relative}`)),
            }),
        )
    }

    const internalList: Record<string, { formal?: boolean; local?: boolean }> = {}
    for (const _ of id) {
        internalList[_] ||= {}
        internalList[_].formal = true
    }
    for (const _ of localID) {
        internalList[_] ||= {}
        internalList[_].local = true
    }

    const tasks = builders.size && awaitTask(parallel(...builders.values()))
    const writeInternalList = writeFile(join(distPath, './plugins.json'), JSON.stringify(internalList, null, 4))
    await Promise.all([tasks, writeInternalList])
    await writeFile(
        join(distPath, './mv3-preload.js'),
        mv3PreloadList.size
            ? (function* () {
                  yield `importScripts(\n`
                  for (const file of mv3PreloadList) {
                      if (file.includes('\\') || file.includes('"')) throw new TypeError('Invalid path')
                      yield '    "/sandboxed-modules/'
                      yield file
                      yield '", \n'
                  }
                  yield `)\nnull`
              })()
            : 'null',
        { encoding: 'utf-8' },
    )
}
export async function buildSandboxedPlugin() {
    const { out = fileURLToPath(new URL('./build', ROOT_PATH)) } = parseArgs({
        options: { out: { type: 'string', short: 'o' } },
        allowPositionals: true,
    }).values
    const path = isAbsolute(out) ? out : join(process.cwd(), out)
    await buildSandboxedPluginConfigurable(path, true)
}
watchTask(buildSandboxedPlugin, watchSandboxedPlugin, 'sbp', 'Build sandboxed plugins', {
    out: 'Target folder to emit output',
})

interface BuilderOptions {
    id: string
    manifestRoot: string
    prefix: string
    distPath: string
    onJS(id: string, relative: string): void
}
function createBuilder({ id, manifestRoot, prefix, distPath, onJS }: BuilderOptions) {
    if (id.includes('..') || id.includes('/')) throw new TypeError(`Invalid plugin: ${id}`)
    function compile() {
        return src(['./**/*'], {
            since: lastRun(compile),
            cwd: manifestRoot,
        })
            .pipe(new TransformStream(id, onJS))
            .pipe(dest(prefix + id, { cwd: distPath }))
    }
    return compile
}
function removeMJSSuffix(name: string) {
    if (name.endsWith('.mjs')) return name.slice(0, -4) + '.js'
    return name
}

async function readCombinedPluginList() {
    const prodURL = new URL('./plugins.json', sandboxedPlugins)
    const localURL = new URL('./plugins-local.json', sandboxedPlugins)

    const formal = await readFile(prodURL, 'utf8').then(parseJSONc)
    const local = await readFile(localURL, 'utf8')
        .then(parseJSONc)
        .catch(() => [])

    assertShape(formal, prodURL)
    assertShape(local, localURL)
    return { formal, local }
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
    constructor(public id: string, public onJS: (id: string, relative: string) => void) {
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
        const relative = file.relative.replace(/\\/g, '/')
        this.onJS(this.id, file.relative)
        const sandboxedPath = 'mask-modules://' + this.id + '/' + relative
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
                file.path = removeMJSSuffix(file.path)
                callback(null, file)
            },
            (err) => callback(err),
        )
    }
}
