import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'
import { useDefaultChainId } from './useDefaultChainId.js'
import { useDebugValue } from 'react'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

export function useChainId<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.ChainIdScope<S, T>,
) {
    const { Provider } = useWeb3State<S, T>(pluginID)
    const defaultChainId = useDefaultChainId(pluginID)
    const actualChainId = useSubscriptionMaybe(Provider?.chainId, undefined)

    const chainId = (expectedChainId ?? actualChainId ?? defaultChainId) as Web3Helper.ChainIdScope<S, T>
    useDebugValue(chainId)
    return chainId
}
