import { Subscription, useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { UNDEIFNED } from '../utils/subscription'
import { useDefaultChainId } from './useDefaultChainId'
import { useCurrentWeb3NetworkChainId } from './Context'

export function useChainId<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { Provider } = useWeb3State(pluginID)
    const currentChainId = useCurrentWeb3NetworkChainId(pluginID)
    const defaultChainId = useDefaultChainId(pluginID) as Web3Helper.Definition[T]['ChainId']
    const actualChainId = useSubscription(
        (Provider?.chainId ?? UNDEIFNED) as Subscription<Web3Helper.Definition[T]['ChainId'] | undefined>,
    )
    return expectedChainId ?? currentChainId ?? actualChainId ?? defaultChainId
}
