import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { trending } from '@masknet/web3-providers/helpers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { TokenType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { PluginTraderRPC } from '../messages.js'

export function useTrendingById(
    result: Web3Helper.TokenResultAll,
    address?: string,
): AsyncState<{
    currency?: TrendingAPI.Currency
    trending?: TrendingAPI.Trending | null
}> {
    const { chainId } = useChainContext({ chainId: result.chainId })
    const currency = trending.getCurrency(result.chainId, result.source)

    const {
        isPending,
        data: coinTrending,
        error,
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
    } = useQuery({
        queryKey: ['get-coin-trending', result, currency?.id],
        queryFn: async () => {
            if (!currency || !result.source) return null
            return (await PluginTraderRPC.getCoinTrending(result, currency)) || null
        },
    })

    const { data: detailedToken } = useFungibleToken(result.pluginID, coinTrending?.coin.contract_address, undefined, {
        chainId: coinTrending?.coin.chainId as ChainId,
    })

    const trendingData = useMemo(() => {
        if (isPending || error || !coinTrending) return
        return {
            ...coinTrending,
            coin: {
                ...coinTrending.coin,
                id: coinTrending.coin.id ?? '',
                name: coinTrending.coin.name ?? '',
                symbol: coinTrending.coin.symbol ?? '',
                type: coinTrending.coin.type ?? TokenType.Fungible,
                decimals: coinTrending.coin.decimals || detailedToken?.decimals || 0,
                contract_address: coinTrending.coin.contract_address ?? coinTrending.contracts?.[0]?.address ?? address,
                chainId: coinTrending.coin.chainId ?? coinTrending.contracts?.[0]?.chainId ?? chainId,
            },
        }
    }, [isPending, error, coinTrending, detailedToken?.decimals])

    if (isPending) {
        return {
            loading: true,
        }
    }

    if (error) {
        return {
            loading: false,
            error: error as Error,
        }
    }

    return {
        value: {
            currency,
            trending: trendingData,
        },
        loading: isPending,
    }
}
