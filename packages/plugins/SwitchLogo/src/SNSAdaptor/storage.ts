import { useSubscription } from 'use-subscription'
import type { ScopedStorage, SwitchLogoType } from '@masknet/shared-base'

export interface SwitchLogoStorageOptions {
    value: Record<string, SwitchLogoType>
}

let storage: ScopedStorage<SwitchLogoStorageOptions> = null!

export function setupStorage(_: ScopedStorage<SwitchLogoStorageOptions>) {
    storage = _
}

export function useSwitchLogoStorage(currentUserId = 'default') {
    const value = useSubscription(storage?.storage.value.subscription)

    return [
        value[currentUserId],
        async (userId: string, newValue: SwitchLogoType) => {
            value[userId] = newValue
            await storage.storage.value.setValue(value)
        },
    ] as const
}
