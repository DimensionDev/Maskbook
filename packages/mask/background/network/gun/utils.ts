import type { default as gun } from 'gun'
import { EventIterator } from 'event-iterator'
export type GunRoot = ReturnType<typeof gun>

/**
 * A sugar for gun.get(path[0]).get(path[1])....get(path[n]).once()
 */
export function getGunData(gun: GunRoot, ...path: string[]) {
    return new Promise<{ [x: string]: unknown } | undefined>((resolve) => {
        const resultNode = path.reduce((gun, path) => gun.get(path as never), gun)
        resultNode.once(resolve)
    })
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

        const resultNode = path.reduce((gun, path) => gun.get(path as never), gun)

        resultNode.map().on((data) => {
            if (listenerClosed) return
            if (isT(data)) queue.push(data)
        })
    })
}
