import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'
import { UNDEFINED } from '../utils/subscription'

export function useCurrencyType<T extends NetworkPluginID>(pluginID?: T) {
    const { Settings } = useWeb3State(pluginID)
    return useSubscription(Settings?.currencyType ?? UNDEFINED)
}
