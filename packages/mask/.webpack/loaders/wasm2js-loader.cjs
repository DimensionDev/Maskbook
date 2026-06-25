const { execFile } = require('node:child_process')
const { mkdtemp, readFile, rm, writeFile } = require('node:fs/promises')
const { tmpdir } = require('node:os')
const { join } = require('node:path')

function resolveWasm2Js() {
    const packageJson = require.resolve('binaryen/package.json')
    return join(packageJson, '../bin/wasm2js')
}

function runWasm2Js(args) {
    return new Promise((resolve, reject) => {
        execFile(process.execPath, [resolveWasm2Js(), ...args], { maxBuffer: 1024 * 1024 * 32 }, (error, stdout, stderr) => {
            if (error) {
                error.message = `${error.message}\n${stderr || stdout}`
                reject(error)
                return
            }
            resolve()
        })
    })
}

async function convertWasmToJs(buffer, { emscripten = false } = {}) {
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

function wasm2jsLoader(source) {
    const callback = this.async()
    this.addDependency(this.resourcePath)

    convertWasmToJs(Buffer.from(source)).then(
        (code) => callback(null, code),
        (error) => callback(error),
    )
}

module.exports = wasm2jsLoader
module.exports.raw = true
module.exports.convertWasmToJs = convertWasmToJs
