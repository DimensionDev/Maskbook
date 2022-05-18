import { useAsyncRetry } from 'react-use'
import type { CurrencyType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useFungibleTokenPrice<T extends NetworkPluginID>(
    pluginID: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptions<T> & {
        currencyType?: CurrencyType
    },
) {
    type GetFungibleTokenPrice = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        address: string,
        currencyType?: CurrencyType,
    ) => Promise<number>

    const chainId = useChainId(pluginID, options?.chainId)
    const { TokenPrice } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!chainId || !TokenPrice) return 0
        return (TokenPrice.getFungibleTokenPrice as GetFungibleTokenPrice)(
            chainId,
            address ?? '',
            options?.currencyType,
        )
    }, [chainId, address, options?.currencyType, TokenPrice])
}
