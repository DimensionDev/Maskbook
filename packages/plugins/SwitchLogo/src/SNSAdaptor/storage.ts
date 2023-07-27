import { useSubscription } from 'use-subscription'
import type { ScopedStorage } from '@masknet/shared-base'

export enum SwitchLogoOpenedState {
    'Opened' = 1,
    'Unopened' = 0,
}
export interface SwitchLogoStorageOptions {
    value: SwitchLogoOpenedState
}

let storage: ScopedStorage<SwitchLogoStorageOptions> = null!

export function setupStorage(_: ScopedStorage<SwitchLogoStorageOptions>) {
    storage = _
}

export function useSwitchLogoStorage() {
    const value = useSubscription(storage?.storage.value.subscription)

    return [
        value,
        async (newValue: SwitchLogoOpenedState) => {
            await storage.storage.value.setValue(newValue)
        },
    ] as const
}
