import { useAsyncRetry } from 'react-use'
import type { CurrencyType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useFungibleTokenPrices<T extends NetworkPluginID>(
    pluginID: T,
    listOfAddress: string[],
    options?: Web3Helper.Web3ConnectionOptions<T> & {
        currencyType?: CurrencyType.USD
    },
) {
    type GetTokenPrices = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        listOfAddress: string[],
        currencyType?: CurrencyType,
    ) => Promise<Record<string, number>>

    const chainId = useChainId(pluginID, options?.chainId)
    const { TokenPrice } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!chainId || !TokenPrice) return
        return (TokenPrice.getTokenPrices as GetTokenPrices)(chainId, listOfAddress, options?.currencyType)
    }, [chainId, listOfAddress, options?.currencyType])
}
