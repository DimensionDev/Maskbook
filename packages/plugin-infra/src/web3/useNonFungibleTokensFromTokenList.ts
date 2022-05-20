import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Hub } from './useWeb3Hub'
import { useChainId } from './useChainId'

export function useNonFungibleTokensFromTokenList<T extends NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3HubOptions<T>,
) {
    type GetNonFungibleTokens = (
        chainId: Web3Helper.Definition[T]['ChainId'],
    ) => Promise<NonFungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>[]>

    const chainId = useChainId(pluginID)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        return (hub?.getNonFungibleTokensFromTokenList as GetNonFungibleTokens | undefined)?.(chainId)
    }, [chainId, hub])
}
