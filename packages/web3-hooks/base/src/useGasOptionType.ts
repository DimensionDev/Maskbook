import { useSubscription } from 'use-subscription'
import { createConstantSubscription, NetworkPluginID } from '@masknet/shared-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useGasOptionType<T extends NetworkPluginID>(pluginID?: T) {
    const { Settings } = useWeb3State(pluginID)
    return useSubscription(Settings?.gasOptionType ?? createConstantSubscription(GasOptionType.NORMAL))
}
