import { useAsync, useAsyncRetry } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { SourceType, SearchResultType, TokenType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ChainId } from '@masknet/web3-shared-evm'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { PluginTraderRPC } from '../messages.js'
import type { Coin } from '../types/index.js'
import { useCurrentCurrency, CURRENCIES_MAP } from './useCurrentCurrency.js'

export function useTrendingById(
    id: string,
    searchType: SearchResultType,
    dataProvider: SourceType | undefined,
    expectedChainId?: Web3Helper.ChainIdAll,
    searchedContractAddress?: string,
): AsyncState<{
    currency?: TrendingAPI.Currency
    trending?: TrendingAPI.Trending | null
}> {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const currency = useCurrentCurrency(dataProvider)
    const {
        value: trending,
        loading,
        error,
    } = useAsync(async () => {
        if (!id) return null

        if (searchType === SearchResultType.CA) {
            const coinInfo = await PluginTraderRPC.getCoinInfoByAddress(undefined, id)
            if (coinInfo?.id) {
                const fungibleTokenTrending = await PluginTraderRPC.getCoinTrending(
                    coinInfo.chainId,
                    coinInfo?.id,
                    CURRENCIES_MAP[SourceType.CoinGecko]![0],
                    SourceType.CoinGecko,
                ).catch(() => null)
                if (fungibleTokenTrending) return fungibleTokenTrending
            }

            return PluginTraderRPC.getCoinTrending(
                undefined,
                id,
                CURRENCIES_MAP[SourceType.NFTScan]![0],
                SourceType.NFTScan,
            ).catch(() => null)
        }
        if (!currency) return null
        if (!dataProvider) return null
        return PluginTraderRPC.getCoinTrending(chainId, id, currency, dataProvider).catch(() => null)
    }, [chainId, dataProvider, currency?.id, id])

    const { value: detailedToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        trending?.coin.contract_address,
        undefined,
        { chainId: trending?.coin.chainId as ChainId },
    )

    if (loading) {
        return {
            loading: true,
        }
    }

    if (error) {
        return {
            loading: false,
            error,
        }
    }

    if (loading) {
        return {
            loading: true,
        }
    }

    if (error) {
        return {
            loading: false,
            error,
        }
    }

    return {
        value: {
            currency,
            trending: trending
                ? {
                      ...trending,
                      coin: createCoinFromTrending(trending, expectedChainId, searchedContractAddress, detailedToken),
                  }
                : null,
        },
        loading,
        error,
    }
}

function createCoinFromTrending(
    trending?: TrendingAPI.Trending,
    expectedChainId?: Web3Helper.ChainIdAll,
    searchedContractAddress?: string,
    token?: Web3Helper.FungibleTokenScope<void, NetworkPluginID.PLUGIN_EVM>,
): Coin {
    return {
        ...trending?.coin,
        id: trending?.coin.id ?? '',
        name: trending?.coin.name ?? '',
        symbol: trending?.coin.symbol ?? '',
        type: trending?.coin.type ?? TokenType.Fungible,
        decimals: trending?.coin.decimals || token?.decimals || 0,
        contract_address:
            searchedContractAddress ?? trending?.contracts?.[0]?.address ?? trending?.coin.contract_address,
        chainId: expectedChainId ?? trending?.contracts?.[0]?.chainId ?? trending?.coin.chainId,
    }
}

export function useCoinInfoByAddress(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return
        return PluginTraderRPC.getCoinInfoByAddress(ChainId.Mainnet, address)
    }, [address])
}
