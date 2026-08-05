import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'
import type { CurrencyType } from '@masknet/web3-shared-base'

export function useCurrencyType(pluginID?: NetworkPluginID): CurrencyType | undefined {
    const { Settings } = useWeb3State(pluginID)
    return useSubscriptionMaybe(Settings?.currencyType, undefined)
}
