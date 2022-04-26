import { defer } from '@dimensiondev/kit'
import { ValueRef } from '@dimensiondev/holoflows-kit'

export type Settings<T> = ValueRef<T> & {
    readonly ready: boolean
    readonly readyPromise: Promise<T>
}

export type ValueComparer<T> = (a: T, b: T) => boolean

export function createInMemorySettings<T extends unknown>(
    value: T,
    comparer: ValueComparer<T> = (a: any, b: any) => a === b,
) {
    const settings = new ValueRef(value, comparer) as Settings<T>
    const [readyPromise, resolve] = defer<T>()

    Object.assign(settings, {
        get ready() {
            return false
        },
        get readyPromise() {
            return readyPromise
        },
    })

    readyPromise.then(() => {
        Object.assign(settings, {
            get ready() {
                return true
            },
        })
    })
    settings.addListener((newValue) => resolve(newValue))

    return settings
}
