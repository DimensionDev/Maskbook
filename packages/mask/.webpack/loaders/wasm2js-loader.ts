import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)

function resolveWasm2Js() {
    const packageJson = require.resolve('binaryen/package.json')
    return join(packageJson, '../bin/wasm2js')
}

function runWasm2Js(args: string[]) {
    return new Promise<void>((resolve, reject) => {
        execFile(
            process.execPath,
            [resolveWasm2Js(), ...args],
            { maxBuffer: 1024 * 1024 * 32 },
            (error, stdout, stderr) => {
                if (error) {
                    error.message = `${error.message}\n${stderr || stdout}`
                    reject(error)
                    return
                }
                resolve()
            },
        )
    })
}

export async function convertWasmToJs(buffer: Buffer, { emscripten = false }: { emscripten?: boolean } = {}) {
    const dir = await mkdtemp(join(tmpdir(), 'mask-wasm2js-'))
    const input = join(dir, 'input.wasm')
    const output = join(dir, 'output.js')
    try {
        await writeFile(input, buffer)
        await runWasm2Js([...(emscripten ? ['--emscripten'] : []), input, '--output', output])
        return await readFile(output, 'utf8')
    } finally {
        await rm(dir, { recursive: true, force: true })
    }
}

export default function wasm2jsLoader(this: import('webpack').LoaderContext<Buffer>, source: Buffer) {
    const callback = this.async()
    this.addDependency(this.resourcePath)

    convertWasmToJs(Buffer.from(source)).then(
        (code) => callback(null, code),
        (error) => callback(error),
    )
}

export const raw = true
