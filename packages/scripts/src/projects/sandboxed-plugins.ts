import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { ensureDir } from 'fs-extra'
import { createRequire } from 'module'
import { join, relative } from 'path'
import { watchTask } from '../utils/task.js'
import { PKG_PATH, ROOT_PATH } from '../utils/paths.js'
import { parseJSONc } from '../utils/jsonc.js'

const SANDBOXED_PLUGINS = new URL('./sandboxed-plugins/', PKG_PATH)
export function watchSandboxedPlugin() {}
export async function buildSandboxedPlugin() {
    await ensureDistFolder()
    const { dev, prod } = await readCombinedPluginList()

    const seen = new Set<string>()
    for (const spec of prod.concat(dev)) {
        const manifestPath = resolveManifestPath(spec)
        if (seen.has(manifestPath)) {
            throw new TypeError(`Multiple specifier points to the same manifest file. ${manifestPath}`)
        }
        if (prod.includes(spec) && relative(fileURLToPath(ROOT_PATH), manifestPath).startsWith('..')) {
            throw new TypeError(`${manifestPath} is not in the repo. Use plugins-local.json instead.`)
        }
        seen.add(manifestPath)

        // next: copy all files and transpile js files.
    }
}
watchTask(buildSandboxedPlugin, watchSandboxedPlugin, 'sbp', 'Build sandboxed plugins')
function ensureDistFolder() {
    return ensureDir(fileURLToPath(new URL('./dist', SANDBOXED_PLUGINS)))
}

async function readCombinedPluginList() {
    const prodURL = new URL('./plugins.json', SANDBOXED_PLUGINS)
    const localURL = new URL('./plugins-local.json', SANDBOXED_PLUGINS)

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
        const require = createRequire(SANDBOXED_PLUGINS)
        return require.resolve(spec.slice(4) + '/mask-manifest.json')
    } else if (spec.startsWith('file:')) {
        const abs = join(fileURLToPath(SANDBOXED_PLUGINS), spec.slice(5), './mask-manifest.json')
        return abs
    } else {
        throw new TypeError('Unknown specifier')
    }
}
