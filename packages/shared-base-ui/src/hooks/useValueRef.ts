import { useSyncExternalStore } from 'react'
import type { ValueRef, ValueRefJSON } from '@masknet/shared-base'

function getServerSnapshot(): never {
    throw new Error('getServerSnapshot is not supported')
}
export function useValueRef<T>(ref: ValueRef<T>): Readonly<T> {
    return useSyncExternalStore(
        (f) => ref.addListener(f),
        () => ref.value,
        getServerSnapshot,
    )
}

/** @deprecated */
export function useValueRefJSON<T extends object>(ref: ValueRefJSON<T>): Readonly<T> {
    return useSyncExternalStore(
        (f) => ref.addListener(f),
        () => ref.asJSON,
    )
}
