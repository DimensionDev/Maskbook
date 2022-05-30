import { useSubscription } from 'use-subscription'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'
import { createConstantSubscription } from '@masknet/shared-base'

export function useGasOptionType<T extends NetworkPluginID>(pluginID?: T) {
    const { Settings } = useWeb3State(pluginID)
    return useSubscription(Settings?.gasOptionType ?? createConstantSubscription(GasOptionType.NORMAL))
}
