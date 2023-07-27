import type { ScopedStorage, SwitchLogoType } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'

export type SwitchLogoStorageOptions = {
    value: Record<string, SwitchLogoType>
}

let switchLogoStorage: ScopedStorage<SwitchLogoStorageOptions>
export function setupStorage(_: ScopedStorage<SwitchLogoStorageOptions>) {
    switchLogoStorage = _
}

export function useSwitchLogoStorage(): [
    value: Record<string, SwitchLogoType>,
    callback: (userId: string, newValue: SwitchLogoType) => void,
] {
    const value = useSubscription(switchLogoStorage?.storage?.value?.subscription)
    return [
        value,
        function setSwitchLogoType(userId: string, newValue: SwitchLogoType) {
            value[userId] = newValue
            switchLogoStorage.storage.value.setValue(value)
        },
    ]
}
