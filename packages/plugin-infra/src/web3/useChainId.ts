import { Subscription, useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { UNDEFINED } from '../utils/subscription'
import { useDefaultChainId } from './useDefaultChainId'
import { useCurrentWeb3NetworkChainId } from './Context'

export function useChainId<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    type Result = S extends 'all' ? Web3Helper.ChainIdAll : Web3Helper.Definition[T]['ChainId']

    const { Provider } = useWeb3State(pluginID)
    const currentChainId = useCurrentWeb3NetworkChainId(pluginID)
    const defaultChainId = useDefaultChainId(pluginID) as Web3Helper.Definition[T]['ChainId']
    const actualChainId = useSubscription(
        (Provider?.chainId ?? UNDEFINED) as Subscription<Web3Helper.Definition[T]['ChainId'] | undefined>,
    )
    return (expectedChainId ?? currentChainId ?? actualChainId ?? defaultChainId) as Result
}
