import { Transform, type TransformCallback } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, join, relative } from 'node:path'
import { createRequire } from 'node:module'
import { ensureDir } from 'fs-extra'
import { awaitTask, watchTask } from '../utils/task.js'
import { PKG_PATH, ROOT_PATH } from '../utils/paths.js'
import { parseJSONc } from '../utils/jsonc.js'
import { transform } from '@swc/core'
import { dest, lastRun, parallel, src, type TaskFunction } from 'gulp'
import { parseArgs } from 'node:util'
import { getLanguageFamilyName } from '../locale-kit-next/index.js'

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

interface Locale {
    url: string
    language: string
}
export async function buildSandboxedPluginConfigurable(distPath: string, isProduction: boolean) {
    distPath = join(distPath, 'sandboxed-modules/')
    await ensureDir(distPath)
    const { local, normal } = await readCombinedPluginList()

    if (isProduction) local.length = 0

    const mv3PreloadList = new Set<string>()
    const builders = new Map<string, TaskFunction>()
    const id = new Set<string>()
    const localID = new Set<string>()

    const languages = new Map<string, Locale[]>()

    for (const spec of normal) {
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
        await getLocales(json, manifestPath).then((x) => languages.set(json.id, x))
        id.add(json.id)
        builders.set(
            manifestPath,
            createBuilder({
                id: json.id,
                manifestRoot: manifestPath.slice(0, -'/mask-manifest.json'.length),
                distPath,
                origin: 'plugin-' + json.id,
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
        await getLocales(json, manifestPath).then((x) => languages.set(json.id, x))
        localID.add(json.id)
        builders.set(
            manifestPath,
            createBuilder({
                id: json.id,
                manifestRoot: manifestPath.slice(0, -'/mask-manifest.json'.length),
                origin: 'local-plugin-' + json.id,
                distPath,
                onJS: (id, relative) => mv3PreloadList.add(removeMJSSuffix(`local-${id}/${relative}`)),
            }),
        )
    }

    const internalList: Record<string, { normal?: boolean; local?: boolean; locales?: Locale[] }> = {}
    for (const _ of id) {
        internalList[_] ||= {}
        internalList[_].normal = true
    }
    for (const _ of localID) {
        internalList[_] ||= {}
        internalList[_].local = true
    }
    for (const [id, locales] of languages) {
        internalList[id]!.locales = locales
    }

    const tasks = builders.size && awaitTask(parallel(...builders.values()))
    const writeInternalList = writeFile(join(distPath, './plugins.json'), JSON.stringify(internalList, null, 4))
    await Promise.all([tasks, writeInternalList])
    await writeFile(
        join(distPath, './mv3-preload.js'),
        mv3PreloadList.size ?
            (function* () {
                yield `importScripts(\n`
                for (const file of mv3PreloadList) {
                    if (file.includes('\\') || file.includes('"')) throw new TypeError('Invalid path')
                    yield '    "/sandboxed-modules/'
                    yield file
                    yield '", \n'
                }
                yield `)\nnull`
            })()
        :   'null',
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
    origin: string
    distPath: string
    onJS(id: string, relative: string): void
}
function createBuilder({ id, manifestRoot, distPath, onJS, origin }: BuilderOptions) {
    if (id.includes('..') || id.includes('/')) throw new TypeError(`Invalid plugin: ${id}`)
    function compile() {
        return src(['./**/*'], {
            since: lastRun(compile),
            cwd: manifestRoot,
        })
            .pipe(new TransformStream(origin, onJS))
            .pipe(dest(origin, { cwd: distPath }))
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

    const normal = await readFile(prodURL, 'utf8').then(parseJSONc)
    const local = await readFile(localURL, 'utf8')
        .then(parseJSONc)
        .catch(() => [])

    assertShape(normal, prodURL)
    assertShape(local, localURL)
    return { normal, local }
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
async function getLocales(manifest: any, manifestPath: string): Promise<Locale[]> {
    const locales = manifest.locales
    if (!locales) return []
    const base = join(manifestPath, '../')
    const localesPath = join(base, locales)
    if (!localesPath.startsWith(base)) throw new TypeError(`locales cannot point to parent of the manifest file.`)
    const directChildren = await readdir(localesPath, { withFileTypes: true })
    const languageFamily = getLanguageFamilyName(directChildren.filter((x) => x.isFile()).map((x) => x.name))
    return [...languageFamily].map(
        ([languageName, languagePossibleFamilyName]): Locale => ({
            language: languagePossibleFamilyName,
            url: locales + (locales.endsWith('/') ? '' : '/') + languageName + '.json',
        }),
    )
}
class TransformStream extends Transform {
    constructor(
        public origin: string,
        public onJS: (id: string, relative: string) => void,
    ) {
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
        this.onJS(this.origin, file.relative)
        const sandboxedPath = 'mask-modules://' + this.origin + '/' + relative
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
