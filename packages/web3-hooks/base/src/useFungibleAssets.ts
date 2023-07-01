import { useEffect } from 'react'
import { noop, unionWith } from 'lodash-es'
import {
    asyncIteratorToArray,
    EMPTY_LIST,
    pageableToIterator,
    type PageIndicator,
    type NetworkPluginID,
} from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { CurrencyType, currySameAddress, isSameAddress, leftShift, minus, toZero } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useWeb3Others } from './useWeb3Others.js'
import { useTrustedFungibleTokens } from './useTrustedFungibleTokens.js'
import { useBlockedFungibleTokens } from './useBlockedFungibleTokens.js'
import { useQuery } from '@tanstack/react-query'

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
    })
    const Others = useWeb3Others(pluginID)
    const trustedTokens = useTrustedFungibleTokens(pluginID)
    const blockedTokens = useBlockedFungibleTokens(pluginID)
    const { BalanceNotifier } = useWeb3State(pluginID)

    const result = useQuery<Array<Web3Helper.FungibleAssetScope<S, T>>>({
        queryKey: ['fungible-assets', pluginID, chainId, account],
        queryFn: async () => {
            if (!account) return EMPTY_LIST
            const isTrustedToken = currySameAddress(trustedTokens.map((x) => x.address))
            const isBlockedToken = currySameAddress(blockedTokens.map((x) => x.address))
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

            const mergedAssets = unionWith(
                assets,
                trustedAssets,
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            )

            const filteredAssets =
                mergedAssets.length && schemaType ? mergedAssets.filter((x) => x.schema === schemaType) : mergedAssets

            return filteredAssets
                .filter((x) => !isBlockedToken(x))
                .sort((a, z) => {
                    // the currently selected chain id
                    if (a.chainId !== z.chainId) {
                        if (a.chainId === chainId) return -1
                        if (z.chainId === chainId) return 1
                    }

                    // native token
                    const isNativeTokenA = isSameAddress(a.address, Others.getNativeTokenAddress(a.chainId))
                    const isNativeTokenZ = isSameAddress(z.address, Others.getNativeTokenAddress(z.chainId))
                    if (isNativeTokenA) return -1
                    if (isNativeTokenZ) return 1

                    // mask token with position value
                    const aUSD = toZero(a.value?.[CurrencyType.USD])
                    const zUSD = toZero(z.value?.[CurrencyType.USD])
                    const isMaskTokenA = isSameAddress(a.address, Others.getMaskTokenAddress(a.chainId))
                    const isMaskTokenZ = isSameAddress(z.address, Others.getMaskTokenAddress(z.chainId))
                    if (aUSD.isPositive() && isMaskTokenA) return -1
                    if (zUSD.isPositive() && isMaskTokenZ) return 1

                    // token value
                    if (!aUSD.isEqualTo(zUSD)) return minus(zUSD, aUSD).isPositive() ? 1 : -1

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
        },
    })

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (isSameAddress(account, ev.account)) {
                    result.refetch()
                }
            }) ?? noop
        )
    }, [account, result.refetch, BalanceNotifier])

    return result
}
