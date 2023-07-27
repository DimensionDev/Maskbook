import { useSubscription } from 'use-subscription'
import type { ScopedStorage, SwitchLogoType } from '@masknet/shared-base'

export type SwitchLogoStorageOptions = {
    value: Record<string, SwitchLogoType>
}

let switchLogoStorage: ScopedStorage<SwitchLogoStorageOptions>

export function setupStorage(_: ScopedStorage<SwitchLogoStorageOptions>) {
    switchLogoStorage = _
}

export function useSwitchLogoStorage(userId?: string) {
    const value = useSubscription(switchLogoStorage?.storage.value.subscription)

    return [
        value[userId || 'default'],
        async function setSwitchLogoType(userId: string, newValue: SwitchLogoType) {
            value[userId] = newValue
            await switchLogoStorage.storage.value.setValue(value)
        },
    ] as const
}
