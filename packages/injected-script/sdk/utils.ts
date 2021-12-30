import { CustomEventId, InternalEvents, encodeEvent } from '../shared'

export function sendEvent<K extends keyof InternalEvents>(name: K, ...params: InternalEvents[K]) {
    document.dispatchEvent(
        new CustomEvent(CustomEventId, {
            cancelable: true,
            bubbles: true,
            detail: encodeEvent(name, params),
        }),
    )
}
const promisePool = new Map<number, [resolve: Function, reject: Function]>()
let id: number = 1
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
