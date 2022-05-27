import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'
import { TRUE, FALSE } from '../utils/subscription'

export function useAllowTestnet<T extends NetworkPluginID>(pluginID?: T) {
    const { Settings } = useWeb3State(pluginID)
    return useSubscription(Settings?.allowTestnet ?? (process.env.NODE_ENV === 'development' ? TRUE : FALSE))
}
