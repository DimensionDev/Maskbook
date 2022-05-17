import { useAsyncRetry } from 'react-use'
import type { CurrencyType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useNonFungibleTokenPrice<T extends NetworkPluginID>(
    pluginID: T,
    address?: string,
    tokenId?: string,
    options?: Web3Helper.Web3ConnectionOptions<T> & {
        currencyType?: CurrencyType
    },
) {
    type GetNonFungibleTokenPrice = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        address: string,
        tokenId: string,
        currencyType?: CurrencyType,
    ) => Promise<number>

    const chainId = useChainId(pluginID, options?.chainId)
    const { TokenPrice } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!chainId || !TokenPrice) return 0
        if (!address || !tokenId) return 0
        return (TokenPrice.getNonFungibleTokenPrice as GetNonFungibleTokenPrice)(
            chainId,
            address,
            tokenId,
            options?.currencyType,
        )
    }, [chainId, address, tokenId, options?.currencyType, TokenPrice])
}
