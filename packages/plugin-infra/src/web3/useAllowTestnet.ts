import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { TRUE, FALSE } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useAllowTestnet<T extends NetworkPluginID>(pluginID?: T) {
    const { Settings } = useWeb3State(pluginID)
    return useSubscription(Settings?.allowTestnet ?? process.env.NODE_ENV === 'development' ? TRUE : FALSE)
}
