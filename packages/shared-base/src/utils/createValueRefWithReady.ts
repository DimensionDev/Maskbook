import { defer } from '@dimensiondev/kit'
import { ValueRef } from '@dimensiondev/holoflows-kit'

export type ValueRefWithReady<T> = ValueRef<T> & {
    readonly ready: boolean
    readonly readyPromise: Promise<T>
}

export type ValueComparer<T> = (a: T, b: T) => boolean

export function createValueRefWithReady<T extends unknown>(
    value: T,
    comparer: ValueComparer<T> = (a: any, b: any) => a === b,
) {
    const settings = new ValueRef(value, comparer) as ValueRefWithReady<T>
    const [readyPromise, resolve] = defer<T>()

    Object.assign(settings, { readyPromise, ready: false })

    readyPromise.then(() => {
        Object.assign(settings, { ready: true })
    })
    settings.addListener((newValue) => resolve(newValue))

    return settings
}
