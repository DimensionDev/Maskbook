import { EventIterator } from 'event-iterator'
import { getGunInstance, GunRoot } from './instance'

function getGunNodeFromPath(path: string[]) {
    const resultNode = path.reduce((gun, path) => gun.get(path as never), getGunInstance())
    return resultNode
}
/**
 * A sugar for gun.get(path[0]).get(path[1])....get(path[n]).once()
 */
export function getGunData(...path: string[]) {
    return new Promise<{ [x: string]: unknown } | undefined>((resolve) => {
        getGunNodeFromPath(path).once(resolve)
    })
}

export function setGunData(path: string[], data: any) {
    getGunNodeFromPath(path).put(data)
}
export function deleteGunData(path: string[]) {
    getGunNodeFromPath(path).put(null!)
}

export function pushToGunDataArray(path: string[], value: object) {
    getGunNodeFromPath(path).set(value)
}

export async function* subscribeGunMapData<T>(path: string[], isT: (x: unknown) => x is T, abortSignal: AbortSignal) {
    yield* new EventIterator<T>((queue) => {
        // gun.off() will remove ALL listener on it
        let listenerClosed = false

        abortSignal.addEventListener('abort', () => {
            queue.stop()
            listenerClosed = true
        })

        const resultNode = getGunNodeFromPath(path)

        resultNode.map().on((data) => {
            if (listenerClosed) return
            if (isT(data)) queue.push(data)
        })
    })
}
