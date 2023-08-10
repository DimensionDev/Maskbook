import type { ScopedStorage } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'

export interface StorageOptions {
    termsConfirmed: boolean | undefined
}
let so: ScopedStorage<StorageOptions>

export function setupStorage(_: ScopedStorage<StorageOptions>) {
    so = _
}

export function useTermsConfirmed(): [value: boolean | undefined, callback: (newValue: boolean) => void] {
    const value = useSubscription(so?.storage?.termsConfirmed?.subscription)
    return [
        value,
        function setConfirmed(newValue: boolean) {
            so?.storage.termsConfirmed.setValue(newValue)
        },
    ]
}
