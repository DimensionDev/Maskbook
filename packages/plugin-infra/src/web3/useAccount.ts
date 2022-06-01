import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'
import { UNDEFINED } from '../utils/subscription'
import { useCurrentWeb3NetworkAccount } from './Context'

export function useAccount<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const { Provider, Others } = useWeb3State<T>(pluginID)
    const currentAccount = useCurrentWeb3NetworkAccount(pluginID)
    const defaultAccount = useSubscription(Provider?.account ?? UNDEFINED)
    const account = expectedAccount ?? currentAccount ?? defaultAccount ?? ''
    return Others?.formatAddress ? Others.formatAddress(account) : account
}
