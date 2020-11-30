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

    require = require('esm')(module)

    globalThis.window = globalThis
    require('../packages/maskbook/src/polyfill/index')
    delete globalThis.window

    return require(path).default
}
function mockedGlobalThis() {
    const globalThis = {}
    class EventTarget {
        addEventListener() {}
        removeEventListener() {}
        dispatchEvent() {}
    }
    class Element extends EventTarget {
        attachShadow() {
            return new ShadowRoot()
        }
        appendChild() {}
    }
    class ShadowRoot extends Element {}
    class Document extends EventTarget {
        constructor() {
            super()
            this.adoptedStyleSheets = []
            this.body = new Element()
            this.documentElement = { onmouseenter() {} }
            this.readyState = 'loading'
        }
        getElementById() {}
        createElement() {
            return new Element()
        }
    }
    globalThis.EventTarget = EventTarget
    globalThis.location = { hostname: 'localhost' }
    globalThis.navigator = { appVersion: '', userAgent: '', language: '', platform: 'ssr' }
    globalThis.ShadowRoot = ShadowRoot
    globalThis.document = new Document()
    globalThis.Event = class {
        get target() {
            return null
        }
    }
    globalThis.Worker = class Worker extends EventTarget {}
    globalThis.sessionStorage = {}
    globalThis.matchMedia = () => Object.assign(new EventTarget(), { matches: false })
    globalThis.browser = {}
    return globalThis
}
