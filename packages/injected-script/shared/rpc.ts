import { CustomEventId, InternalEvents, encodeEvent } from './event.js'
import { $, $Blessed, $Content } from './intrinsic.js'

export function sendEvent<K extends keyof InternalEvents>(name: K, ...params: InternalEvents[K]) {
    $Content.dispatchEvent(
        document,
        new CustomEvent(CustomEventId, {
            cancelable: true,
            bubbles: true,
            detail: encodeEvent(name, params),
        }),
    )
}

const promisePool = $Blessed.Map<number, { resolve: Function; reject: Function }>()
export function createRequest<T>(callback: (id: number) => void) {
    return $Blessed.Promise<T>((resolve, reject) => {
        const id = $.random()
        promisePool.set(id, { resolve, reject })
        callback(id)
    })
}
export function resolvePromise(id: number, data: unknown) {
    const pair = promisePool.get(id)
    if (pair) {
        pair.resolve(data)
        promisePool.delete(id)
    }
}
export function rejectPromise(id: number, data: unknown) {
    const pair = promisePool.get(id)
    if (pair) {
        pair.reject(data)
        promisePool.delete(id)
    }
}
