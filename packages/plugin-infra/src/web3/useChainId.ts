import { useSubscription } from 'use-subscription'
import { useWeb3State, Web3Helper } from '../entry-web3'
import { ZERO } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useChainId<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { Provider } = useWeb3State(pluginID)
    const defaultChainId = useSubscription(Provider?.chainId ?? ZERO)
    return expectedChainId ?? (defaultChainId as Web3Helper.Definition[T]['ChainId'])
}
