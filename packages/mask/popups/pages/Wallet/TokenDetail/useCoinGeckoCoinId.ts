import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNativeToken } from '@masknet/web3-hooks-base'
import { CoinGeckoTrending, DSearch } from '@masknet/web3-providers'
import { fetchChains } from '@masknet/web3-providers/helpers'
import { SearchResultType } from '@masknet/web3-shared-base'
import { type ChainId, isNativeTokenAddress, getCoinGeckoConstant } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useCoinGeckoCoinId(chainId: ChainId, address?: string) {
    const isNativeToken = isNativeTokenAddress(address)
    const erc20CoinId = useQuery({
        enabled: !isNativeToken && !!address,
        queryKey: ['coin-gecko', 'coin-id', 'by-address', address, chainId],
        queryFn: async () => {
            const coinInfo = await CoinGeckoTrending.getCoinInfoByAddress(address!, chainId)
            return coinInfo?.id
        },
    })

    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: fallbackSymbol } = useQuery({
        queryKey: ['chain-list'],
        queryFn: fetchChains,
        select: (chains) => chains.find((x) => x.chainId === chainId)?.nativeCurrency.symbol,
    })
    const symbol = nativeToken?.symbol || fallbackSymbol

    const nativeCoinId = useQuery({
        enabled: isNativeToken,
        queryKey: ['native-token', 'coin-id', chainId, symbol],
        queryFn: async () => {
            const constantCoinId = getCoinGeckoConstant(chainId, 'COIN_ID')
            if (constantCoinId) return constantCoinId
            const results = await DSearch.search<Web3Helper.TokenResultAll>(symbol!, SearchResultType.FungibleToken)
            return results[0]?.id
        },
    })
    return isNativeToken ? nativeCoinId : erc20CoinId
}
