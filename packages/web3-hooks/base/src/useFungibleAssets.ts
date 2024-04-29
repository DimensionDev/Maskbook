import {
    EMPTY_LIST,
    asyncIteratorToArray,
    pageableToIterator,
    type NetworkPluginID,
    type PageIndicator,
} from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { CurrencyType, currySameAddress, isSameAddress, leftShift, minus } from '@masknet/web3-shared-base'
import { BigNumber } from 'bignumber.js'
import { useQuery } from '@tanstack/react-query'
import { noop, unionWith } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { useBlockedFungibleTokens } from './useBlockedFungibleTokens.js'
import { useChainContext } from './useContext.js'
import { useTrustedFungibleTokens } from './useTrustedFungibleTokens.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useWeb3Utils } from './useWeb3Utils.js'
import { useWeb3State } from './useWeb3State.js'
import { useNetworks } from './useNetworks.js'

export function useFungibleAssets<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: HubOptions<T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account, chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, {
        account,
        chainId,
        ...options,
    } as HubOptions<T>)
    const Utils = useWeb3Utils(pluginID)
    const trustedTokens = useTrustedFungibleTokens(pluginID)
    const blockedTokens = useBlockedFungibleTokens(pluginID)
    const { BalanceNotifier, Network } = useWeb3State(pluginID)
    const networks = useNetworks()

    const query = useQuery<Array<Web3Helper.FungibleAssetScope<S, T>>>({
        queryKey: ['fungible-assets', pluginID, account],
        queryFn: async () => {
            if (!account) return EMPTY_LIST
            const iterator = pageableToIterator(async (indicator?: PageIndicator) => {
                return Hub.getFungibleAssets(account, {
                    indicator,
                    size: 50,
                })
            })

            const trustedAssetsIterator = pageableToIterator(async (indicator?: PageIndicator) => {
                return Hub.getTrustedFungibleAssets(account, trustedTokens, { indicator, size: 50 })
            })
            const assets = await asyncIteratorToArray(iterator)
            const trustedAssets = await asyncIteratorToArray(trustedAssetsIterator)
            const networkIds = networks.map((x) => x.chainId)

            const list = unionWith(
                assets,
                trustedAssets.map((x) => ({ ...x, isCustomToken: true })),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            )
            return list.filter((x) => networkIds.includes(x.chainId))
        },
    })
    const mergedAssets = query.data || EMPTY_LIST
    // Hub.getFungibleAssets relies on networks.
    useEffect(() => {
        return Network?.networks?.subscribe(() => {
            query.refetch()
        })
    }, [query.refetch])

    const assets: Array<Web3Helper.FungibleAssetScope<S, T>> = useMemo(() => {
        const isTrustedToken = currySameAddress(trustedTokens.map((x) => x.address))
        const isBlockedToken = currySameAddress(blockedTokens.map((x) => x.address))
        const filteredAssets =
            mergedAssets.length && schemaType ? mergedAssets.filter((x) => x.schema === schemaType) : mergedAssets

        return filteredAssets
            .filter((x) => !isBlockedToken(x))
            .sort((a, z) => {
                // mask token with position value
                const aUSD = new BigNumber(a.value?.[CurrencyType.USD] || 0)
                const zUSD = new BigNumber(z.value?.[CurrencyType.USD] || 0)
                // token value
                if (!aUSD.eq(zUSD)) return zUSD.gt(aUSD) ? 1 : -1

                // the currently selected chain id
                if (a.chainId !== z.chainId) {
                    if (a.chainId === chainId) return -1
                    if (z.chainId === chainId) return 1
                }

                // native token
                const isNativeTokenA = isSameAddress(a.address, Utils.getNativeTokenAddress(a.chainId))
                const isNativeTokenZ = isSameAddress(z.address, Utils.getNativeTokenAddress(z.chainId))
                if (isNativeTokenA !== isNativeTokenZ) {
                    if (isNativeTokenA) return -1
                    if (isNativeTokenZ) return 1
                }

                const isMaskTokenA = isSameAddress(a.address, Utils.getMaskTokenAddress(a.chainId))
                const isMaskTokenZ = isSameAddress(z.address, Utils.getMaskTokenAddress(z.chainId))
                if (aUSD.isPositive() && isMaskTokenA) return -1
                if (zUSD.isPositive() && isMaskTokenZ) return 1

                // token balance
                const aBalance = leftShift(a.balance, a.decimals)
                const zBalance = leftShift(z.balance, z.decimals)
                if (!aBalance.isEqualTo(zBalance)) return minus(zBalance, aBalance).isPositive() ? 1 : -1

                // trusted token
                if (isTrustedToken(a.address)) return -1
                if (isTrustedToken(z.address)) return 1

                // mask token with position value
                if (isMaskTokenA) return -1
                if (isMaskTokenZ) return 1

                // alphabet
                if (a.name !== z.name) return a.name < z.name ? -1 : 1

                return 0
            })
    }, [mergedAssets, trustedTokens, blockedTokens, schemaType, chainId])

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (isSameAddress(account, ev.account)) {
                    query.refetch()
                }
            }) ?? noop
        )
    }, [account, query.refetch, BalanceNotifier])

    return [assets, query] as const
}
