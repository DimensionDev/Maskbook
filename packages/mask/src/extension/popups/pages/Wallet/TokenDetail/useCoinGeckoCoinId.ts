import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNativeToken } from '@masknet/web3-hooks-base'
import { CoinGeckoTrending, DSearch } from '@masknet/web3-providers'
import { type ChainId, getTokenConstant, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useCoinGeckoCoinId(chainId: ChainId, address?: string) {
    const isNativeToken = isNativeTokenAddress(address)
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: coinInfo } = useQuery({
        enabled: !isNativeToken,
        queryKey: ['coin-gecko', 'coin-info', 'by-address', address],
        queryFn: async () => {
            return CoinGeckoTrending.getCoinInfoByAddress(address ?? getTokenConstant(chainId, 'NATIVE_TOKEN_ADDRESS'))
        },
    })

    const { data: result = EMPTY_LIST } = useQuery({
        enabled: !!nativeToken?.symbol && isNativeToken,
        queryKey: ['native-token-result', nativeToken?.symbol],
        queryFn: async () => DSearch.search<Web3Helper.TokenResultAll>(nativeToken!.symbol),
    })

    return isNativeToken ? result[0]?.id : coinInfo?.id
}
