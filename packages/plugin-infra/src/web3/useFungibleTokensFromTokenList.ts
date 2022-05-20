import { useAsyncRetry } from 'react-use'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3Hub } from './useWeb3Hub'

export function useFungibleTokensFromTokenList<T extends NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3HubOptions<T>,
) {
    type GetFungibleTokens = (
        chainId: Web3Helper.Definition[T]['ChainId'],
    ) => Promise<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>[]>

    const chainId = useChainId(pluginID)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        return (hub?.getFungibleTokensFromTokenList as GetFungibleTokens | undefined)?.(chainId)
    }, [chainId, hub])
}
