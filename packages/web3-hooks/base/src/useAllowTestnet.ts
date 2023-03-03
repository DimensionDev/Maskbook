import { useSubscription } from 'use-subscription'
import { FALSE, TRUE, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useAllowTestnet<T extends NetworkPluginID>(pluginID?: T) {
    const { Settings } = useWeb3State(pluginID)
    return useSubscription(Settings?.allowTestnet ?? (process.env.NODE_ENV === 'development' ? TRUE : FALSE))
}
