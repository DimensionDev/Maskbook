import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNativeToken } from '@masknet/web3-hooks-base'
import { CoinGeckoTrending, DSearch } from '@masknet/web3-providers'
import { type ChainId, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useCoinGeckoCoinId(chainId: ChainId, address?: string) {
    const isNativeToken = isNativeTokenAddress(address)
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const erc20Result = useQuery({
        enabled: !isNativeToken && !!address,
        queryKey: ['coin-gecko', 'coin-info', 'by-address', address],
        queryFn: async () => {
            const coinInfo = await CoinGeckoTrending.getCoinInfoByAddress(address!)
            return coinInfo?.id
        },
    })

    const nativeTokenResult = useQuery({
        enabled: !!nativeToken?.symbol && isNativeToken,
        queryKey: ['native-token-result', nativeToken?.symbol],
        queryFn: async () => {
            const results = await DSearch.search<Web3Helper.TokenResultAll>(nativeToken!.symbol)
            return results[0]?.id
        },
    })
    return isNativeToken ? nativeTokenResult : erc20Result
}
