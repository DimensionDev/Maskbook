import { useSubscription } from 'use-subscription'
import { UNDEFINED, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Utils } from './useWeb3Utils.js'

export function useAccount<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const Utils = useWeb3Utils(pluginID)
    const { Provider } = useWeb3State(pluginID)
    const defaultAccount = useSubscription(Provider?.account ?? UNDEFINED)
    return Utils.formatAddress(expectedAccount ?? defaultAccount ?? '')
}
