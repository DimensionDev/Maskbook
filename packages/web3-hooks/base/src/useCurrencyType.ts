import { useSubscription } from 'use-subscription'
import type {} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { UNDEFINED } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useCurrencyType<T extends NetworkPluginID>(pluginID?: T) {
    const { Settings } = useWeb3State(pluginID)
    return useSubscription(Settings?.currencyType ?? UNDEFINED)
}
