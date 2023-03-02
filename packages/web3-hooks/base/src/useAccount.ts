import { useSubscription } from 'use-subscription'
import { UNDEFINED, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useAccount<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const Web3State = useWeb3State(pluginID)
    const { Provider, Others } = Web3State
    const defaultAccount = useSubscription(Provider?.account ?? UNDEFINED)
    const account = expectedAccount ?? defaultAccount ?? ''
    return Others?.formatAddress ? Others.formatAddress(account) : account
}
