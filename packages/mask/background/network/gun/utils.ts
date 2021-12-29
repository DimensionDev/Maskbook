import { EventIterator } from 'event-iterator'
import type { GunRoot } from './instance'

function getGunNodeFromPath(gun: GunRoot, path: string[]) {
    const resultNode = path.reduce((gun, path) => gun.get(path as never), gun)
    return resultNode
}
/**
 * A sugar for gun.get(path[0]).get(path[1])....get(path[n]).once()
 */
export function getGunData(gun: GunRoot, ...path: string[]) {
    return new Promise<{ [x: string]: unknown } | undefined>((resolve) => {
        getGunNodeFromPath(gun, path).once(resolve)
    })
}

export function setGunData(gun: GunRoot, path: string[], data: any) {
    getGunNodeFromPath(gun, path).put(data)
}
export function deleteGunData(gun: GunRoot, path: string[]) {
    getGunNodeFromPath(gun, path).put(null!)
}

export function pushToGunDataArray(gun: GunRoot, path: string[], value: object) {
    getGunNodeFromPath(gun, path).set(value)
}

export async function* subscribeGunMapData<T>(
    gun: GunRoot,
    path: string[],
    isT: (x: unknown) => x is T,
    abortSignal: AbortSignal,
) {
    yield* new EventIterator<T>((queue) => {
        // gun.off() will remove ALL listener on it
        let listenerClosed = false

        abortSignal.addEventListener('abort', () => {
            queue.stop()
            listenerClosed = true
        })

        const resultNode = getGunNodeFromPath(gun, path)

        resultNode.map().on((data) => {
            if (listenerClosed) return
            if (isT(data)) queue.push(data)
        })
    })
}
