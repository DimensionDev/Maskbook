import { EventIterator } from 'event-iterator'
import { getGunInstance, OnCloseEvent } from './instance.js'

function getGunNodeFromPath(path: string[]) {
    const resultNode = path.reduce((gun, path) => gun.get(path as never), getGunInstance())
    return resultNode
}
/**
 * Get data from Gun. Equivalent as the following code:
 *
 * ```ts
 * gun.get(path[0]).get(path[1])....get(path[n]).once()
 * ```
 */
export function getGunData(...path: string[]) {
    return new Promise<{ [x: string]: unknown } | string | number | undefined>((resolve) => {
        getGunNodeFromPath(path).once(resolve)
    })
}

/**
 * Set data on Gun. Equivalent as the following code:
 *
 * ```ts
 * gun.get(path[0]).get(path[1])....get(path[n]).put(data)
 * ```
 * @param path graph path on Gun
 * @param data data to be stored
 */
export function setGunData(path: string[], data: any) {
    getGunNodeFromPath(path).put(data)
}

/**
 * Delete data on Gun. Equivalent as the following code:
 *
 * ```ts
 * gun.get(path[0]).get(path[1])....get(path[n]).put(null!)
 * ```
 * @param path graph path on Gun
 */
export function deleteGunData(path: string[]) {
    getGunNodeFromPath(path).put(null!)
}

/**
 * Push data to the Gun data Set (Mathematical Set)
 * @param path graph path on Gun
 * @param value the object to be stored
 */
export function pushToGunDataArray(path: string[], value: object) {
    getGunNodeFromPath(path).set(value)
}

/**
 * Subscribe future data on Gun.
 * When subscribing a Gun data Set (Mathematical Set), you will not get the immediate result back.
 *
 * @param path graph path on Gun
 * @param isT is the data type T
 * @param abortSignal the signal to stop subscribing
 */
export async function* subscribeGunMapData<T>(path: string[], isT: (x: unknown) => x is T, abortSignal: AbortSignal) {
    yield* new EventIterator<T>((queue) => {
        // gun.off() will remove ALL listener on it
        let listenerClosed = false

        function stop() {
            queue.stop()
            listenerClosed = true
            OnCloseEvent.delete(stop)
        }
        abortSignal.addEventListener('abort', stop)
        OnCloseEvent.add(stop)

        const resultNode = getGunNodeFromPath(path)

        resultNode.map().on((data) => {
            if (listenerClosed) return
            if (isT(data)) queue.push(data)
        })
    })
}
