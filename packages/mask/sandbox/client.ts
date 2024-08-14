import type { EventBasedChannel } from 'async-call-rpc'
import { type BridgeServiceRequest, type MainToIframe } from './types.js'

let initialized = false
const services: Record<string, Set<(data: unknown) => void>> = {}

class Storage implements globalThis.Storage {
    constructor() {
        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get: (target, p, receiver) => {
                if (Reflect.has(Storage.prototype, p) || typeof p === 'symbol') return Reflect.get(target, p, receiver)
                return this.#store[p]
            },
            set: (target, p, newValue, receiver) => {
                if (Reflect.has(Storage.prototype, p) || typeof p === 'symbol')
                    return Reflect.set(target, p, newValue, receiver)
                this.#store[p] = String(newValue)
                return true
            },
        })
    }
    #store: Record<string, null | string> = { __proto__: null }
    get length() {
        return Object.keys(this.#store).length
    }
    key(index: number): string | null {
        return Object.keys(this.#store)[index]
    }
    removeItem(key: string) {
        delete this.#store[key]
    }
    setItem(key: string, value: string) {
        this.#store[String(key)] = String(value)
    }
    clear() {
        this.#store = { __proto__: null }
    }
    getItem(key: string): string | null {
        return String(this.#store[key] || null)
    }
}
function init() {
    initialized = true
    {
        const local = new Storage()
        const session = new Storage()
        Object.defineProperties(globalThis, {
            localStorage: { get: () => local, configurable: true, enumerable: true },
            sessionStorage: { get: () => session, configurable: true, enumerable: true },
        })
    }
    globalThis.addEventListener('message', (event) => {
        const message = event.data as MainToIframe
        if (message.type === 'service') {
            services[message.name]?.forEach((callback) => callback(message.data))
        }
    })
}

export function createBridgedServiceChannel(name: string): EventBasedChannel {
    !initialized && init()
    services[name] = new Set()
    return {
        send: (data) => parent.postMessage({ type: 'service', name, data } satisfies BridgeServiceRequest, '*'),
        on: (callback) => {
            services[name].add(callback)
            return () => services[name].delete(callback)
        },
    }
}
