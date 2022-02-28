import { spawn } from 'child_process'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { LoaderContext } from 'webpack'

export default function loader(this: LoaderContext<any>, source: Buffer) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [
            join(__dirname, '../node_modules/binaryen/bin/wasm2js'),
            this.resourcePath,
        ])
        const out: string[] = []
        const err: string[] = []
        child.stdout.setEncoding('utf-8')
        child.stderr.setEncoding('utf-8')
        child.stdout.on('data', (data) => out.push(data.toString()))
        child.stderr.on('data', (data) => err.push(data.toString()))
        child.on('close', (code) => {
            if (code !== 0) reject(new Error(err.join('\n')))
            else resolve(out.join(''))
            writeFileSync('./out.js', out.join(''))
        })
    })
}
loader.raw = true
