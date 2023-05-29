import { useSubscription } from 'use-subscription'
import { UNDEFINED, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Others } from './useWeb3Others.js'

export function useAccount<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const Others = useWeb3Others(pluginID)
    const { Provider } = useWeb3State(pluginID)
    const defaultAccount = useSubscription(Provider?.account ?? UNDEFINED)
    return Others.formatAddress(expectedAccount ?? defaultAccount ?? '')
}
