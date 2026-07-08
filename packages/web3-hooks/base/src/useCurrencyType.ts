import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

export function useCurrencyType<T extends NetworkPluginID>(pluginID?: T) {
    const { Settings } = useWeb3State(pluginID)
    return useSubscriptionMaybe(Settings?.currencyType, undefined)
}
