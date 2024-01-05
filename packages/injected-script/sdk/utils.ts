import { CustomEventId, type InternalEvents, encodeEvent } from '../shared/index.js'

let warned = false
export function sendEvent<K extends keyof InternalEvents>(name: K, ...params: InternalEvents[K]) {
    if (!warned && typeof location === 'object' && location.protocol.includes('extension')) {
        if (location.href.includes('background')) {
            throw new Error('This package is not expected to be imported in background script. Please check your code.')
        }
        console.warn('This code is not expected to be run in the extension pages. Please check your code.')
        warned = true
    }
    if (typeof document === 'undefined') return
    document.dispatchEvent(
        new CustomEvent(CustomEventId, {
            cancelable: true,
            bubbles: true,
            detail: encodeEvent(name, params),
        }),
    )
}
const promisePool = new Map<number, [resolve: (value: any) => void, reject: (reason?: any) => void]>()
let id = 1
export function createPromise<T>(callback: (id: number) => void) {
    return new Promise<T>((resolve, reject) => {
        id += 1
        promisePool.set(id, [resolve, reject])
        callback(id)
    })
}
export function resolvePromise(id: number, data: unknown) {
    const pair = promisePool.get(id)
    if (pair) {
        pair[0](data)
        promisePool.delete(id)
    }
}
export function rejectPromise(id: number, data: unknown) {
    const pair = promisePool.get(id)
    if (pair) {
        pair[1](data)
        promisePool.delete(id)
    }
}
