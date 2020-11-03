const { resolve } = require('path')
const { isMainThread, Worker, parentPort, workerData } = require('worker_threads')

if (require.main === module && isMainThread) {
    const target = process.argv.slice(2)[0]
    const path = resolve(process.cwd(), target)
    // SSR(path).then(console.log, console.error)
    worker(path).then(console.log, console.error)
}
if (!isMainThread) {
    worker(String(workerData)).then((x) => parentPort.postMessage(x))
}
async function SSR(path) {
    const worker = new Worker(__filename, { workerData: path })
    const promise = new Promise((resolve, reject) => {
        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
        })
    })
    promise.finally(() => worker.terminate())
    return promise
}
module.exports.SSR = SSR
async function worker(path) {
    require('ts-node').register({ project: require.resolve('../tsconfig.json'), transpileOnly: true })
    Object.assign(globalThis, mockedGlobalThis())

    globalThis.window = globalThis
    require('../packages/maskbook/src/polyfill/index')
    delete globalThis.window

    return require(path).default
}
function mockedGlobalThis() {
    const globalThis = {}
    const EventTarget = { addEventListener() {} }
    globalThis.location = { hostname: 'localhost' }
    globalThis.navigator = { appVersion: '', userAgent: '', language: '', platform: 'ssr' }
    globalThis.document = {
        adoptedStyleSheets: {},
        getElementById() {},
        createElement() {
            return {
                attachShadow() {
                    return EventTarget
                },
            }
        },
        body: { appendChild() {} },
        ...EventTarget,
        documentElement: {
            onmouseenter() {},
        },
        readyState: 'loading',
    }
    globalThis.ShadowRoot = class {}
    globalThis.Event = class {
        get target() {
            return null
        }
    }
    globalThis.Worker = class {}
    globalThis.sessionStorage = {}
    globalThis.matchMedia = () => {
        return { matches: false, ...EventTarget }
    }
    return globalThis
}
