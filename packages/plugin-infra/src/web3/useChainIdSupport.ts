import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import type { Web3Helper } from '../web3-helpers'

export function useChainIdSupport<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
    feature?: string,
) {
    type IsSupport = (chainId?: Web3Helper.Definition[T]['ChainId'], feature?: string) => boolean

    const chainId = useChainId(pluginID, expectedChainId)
    const { Others } = useWeb3State(pluginID)

    return (Others?.chainResolver.isSupport as IsSupport | undefined)?.(chainId, feature) ?? false
}
