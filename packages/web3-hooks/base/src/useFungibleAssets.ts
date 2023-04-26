import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { noop, unionWith } from 'lodash-es'
import {
    asyncIteratorToArray,
    EMPTY_LIST,
    pageableToIterator,
    type PageIndicator,
    type NetworkPluginID,
} from '@masknet/shared-base'
import { CurrencyType, currySameAddress, isSameAddress, leftShift, minus, toZero } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useWeb3State } from './useWeb3State.js'
import { useTrustedFungibleTokens } from './useTrustedFungibleTokens.js'
import { useBlockedFungibleTokens } from './useBlockedFungibleTokens.js'

export function useFungibleAssets<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account, chainId: options?.chainId })
    const hub = useWeb3Hub(pluginID, options)
    const trustedTokens = useTrustedFungibleTokens(pluginID)
    const blockedTokens = useBlockedFungibleTokens(pluginID)
    const { Others, BalanceNotifier } = useWeb3State(pluginID)

    const asyncRetry = useAsyncRetry<Array<Web3Helper.FungibleAssetScope<S, T>>>(async () => {
        if (!account || !hub) return EMPTY_LIST

        const isTrustedToken = currySameAddress(trustedTokens.map((x) => x.address))
        const isBlockedToken = currySameAddress(blockedTokens.map((x) => x.address))
        const iterator = pageableToIterator(async (indicator?: PageIndicator) => {
            if (!hub.getFungibleAssets) return
            return hub.getFungibleAssets(account, {
                indicator,
                size: 50,
            })
        })

        const trustedAssetsIterator = pageableToIterator(async (indicator?: PageIndicator) => {
            if (!hub.getTrustedFungibleAssets) return
            return hub.getTrustedFungibleAssets(account, trustedTokens, { indicator, size: 50 })
        })
        const assets = await asyncIteratorToArray(iterator)
        const trustedAssets = await asyncIteratorToArray(trustedAssetsIterator)

        const _assets = unionWith(
            assets,
            trustedAssets,
            (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
        )

        const filteredAssets = _assets.length && schemaType ? _assets.filter((x) => x.schema === schemaType) : _assets

        return filteredAssets
            .filter((x) => !isBlockedToken(x))
            .sort((a, z) => {
                const aBalance = leftShift(a.balance, a.decimals)
                const zBalance = leftShift(z.balance, z.decimals)

                const aUSD = toZero(a.value?.[CurrencyType.USD])
                const zUSD = toZero(z.value?.[CurrencyType.USD])

                const isNativeTokenA = isSameAddress(a.address, Others?.getNativeTokenAddress(a.chainId))
                const isNativeTokenZ = isSameAddress(z.address, Others?.getNativeTokenAddress(z.chainId))

                const isMaskTokenA = isSameAddress(a.address, Others?.getMaskTokenAddress(a.chainId))
                const isMaskTokenZ = isSameAddress(z.address, Others?.getMaskTokenAddress(z.chainId))

                // the currently selected chain id
                if (a.chainId !== z.chainId) {
                    if (a.chainId === chainId) return -1
                    if (z.chainId === chainId) return 1
                }

                // native token
                if (isNativeTokenA) return -1
                if (isNativeTokenZ) return 1

                // mask token with position value
                if (aUSD.isPositive() && isMaskTokenA) return -1
                if (zUSD.isPositive() && isMaskTokenZ) return 1

                // token value
                if (!aUSD.isEqualTo(zUSD)) return minus(zUSD, aUSD).isPositive() ? 1 : -1

                // token balance
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
    }, [account, chainId, schemaType, hub, trustedTokens, blockedTokens, Others])

    useEffect(() => {
        BalanceNotifier?.emitter.on('update', (ev) => {
            if (isSameAddress(account, ev.account)) {
                asyncRetry.retry()
            }
        }) ?? noop
    }, [account, asyncRetry.retry, BalanceNotifier])

    return asyncRetry
}
