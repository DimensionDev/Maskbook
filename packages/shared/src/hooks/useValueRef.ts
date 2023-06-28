import { useSyncExternalStore } from 'react'
import type { ValueRef, ValueRefJSON } from '@masknet/shared-base'

export function useValueRef<T>(ref: ValueRef<T>): Readonly<T> {
    return useSyncExternalStore(
        (f) => ref.addListener(f),
        () => ref.value,
        () => ref.getServerSnapshot(),
    )
}

/** @deprecated */
export function useValueRefJSON<T extends object>(ref: ValueRefJSON<T>): Readonly<T> {
    return useSyncExternalStore(
        (f) => ref.addListener(f),
        () => ref.asJSON,
    )
}
