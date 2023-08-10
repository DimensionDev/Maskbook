import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNativeToken } from '@masknet/web3-hooks-base'
import { CoinGeckoTrending, DSearch } from '@masknet/web3-providers'
import { type ChainId, isNativeTokenAddress, getCoinGeckoConstant } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useCoinGeckoCoinId(chainId: ChainId, address?: string) {
    const isNativeToken = isNativeTokenAddress(address)
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const erc20CoinId = useQuery({
        enabled: !isNativeToken && !!address,
        queryKey: ['coin-gecko', 'coin-id', 'by-address', address],
        queryFn: async () => {
            const coinInfo = await CoinGeckoTrending.getCoinInfoByAddress(address!, chainId)
            return coinInfo?.id
        },
    })

    const nativeCoinId = useQuery({
        enabled: !!nativeToken?.symbol && isNativeToken,
        queryKey: ['native-token', 'coin-id', nativeToken?.symbol],
        queryFn: async () => {
            const constantCoinId = getCoinGeckoConstant(chainId, 'COIN_ID')
            if (constantCoinId) return constantCoinId
            const results = await DSearch.search<Web3Helper.TokenResultAll>(nativeToken!.symbol)
            return results[0]?.id
        },
    })
    return isNativeToken ? nativeCoinId : erc20CoinId
}
