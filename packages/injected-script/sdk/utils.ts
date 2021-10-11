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
export function createPromise<T>(callback: (id: number) => void) {
    return new Promise<T>((resolve, reject) => {
        const id = Math.random()
        promisePool.set(id, [resolve, reject])
        callback(id)
    })
}
export function resolvePromise(id: number, data: unknown) {
    promisePool.get(id)?.[0](data)
}
export function rejectPromise(id: number, data: unknown) {
    promisePool.get(id)?.[1](data)
}
