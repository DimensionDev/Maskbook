import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'
import { UNDEFINED } from '../utils/subscription.js'
import { useDefaultChainId } from './useDefaultChainId.js'
import { useCurrentWeb3NetworkChainId } from './useContext.js'

export function useChainId<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.ChainIdScope<S, T>,
) {
    const { Provider } = useWeb3State<S, T>(pluginID)
    const currentChainId = useCurrentWeb3NetworkChainId(pluginID)
    const defaultChainId = useDefaultChainId(pluginID)
    const actualChainId = useSubscription(Provider?.chainId ?? UNDEFINED)
    return (expectedChainId ?? currentChainId ?? actualChainId ?? defaultChainId) as Web3Helper.ChainIdScope<S, T>
}

export function useActualChainId<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.ChainIdScope<S, T>,
) {
    const { Provider } = useWeb3State<S, T>(pluginID)
    const defaultChainId = useDefaultChainId(pluginID)
    const actualChainId = useSubscription(Provider?.chainId ?? UNDEFINED)
    return (expectedChainId ?? actualChainId ?? defaultChainId) as Web3Helper.ChainIdScope<S, T>
}
