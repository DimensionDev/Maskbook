import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray, EMPTY_LIST } from '@masknet/shared-base'
import {
    CurrencyType,
    currySameAddress,
    formatBalance,
    HubIndicator,
    isSameAddress,
    minus,
    NetworkPluginID,
    pageableToIterator,
    toZero,
} from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3Hub } from './useWeb3Hub'
import { useWeb3State } from './useWeb3State'
import { useTrustedFungibleTokens } from './useTrustedFungibleTokens'
import { useBlockedFungibleTokens } from './useBlockedFungibleTokens'

export function useFungibleAssets<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID, options?.chainId)
    const hub = useWeb3Hub(pluginID, options)
    const trustedTokens = useTrustedFungibleTokens(pluginID)
    const blockedTokens = useBlockedFungibleTokens(pluginID)
    const { Others } = useWeb3State(pluginID)

    return useAsyncRetry<Array<Web3Helper.FungibleAssetScope<S, T>>>(async () => {
        if (!account || !hub) return EMPTY_LIST

        const isTrustedToken = currySameAddress(trustedTokens.map((x) => x.address))
        const isBlockedToken = currySameAddress(blockedTokens.map((x) => x.address))
        const iterator = pageableToIterator(async (indicator?: HubIndicator) => {
            if (!hub.getFungibleAssets) return
            return hub.getFungibleAssets(account, {
                indicator,
                size: 50,
            })
        })
        const assets = await asyncIteratorToArray(iterator)
        const filteredAssets = assets.length && schemaType ? assets.filter((x) => x.schema === schemaType) : assets

        return filteredAssets
            .filter((x) => !isBlockedToken(x))
            .sort((a, z) => {
                const aBalance = toZero(formatBalance(a.balance, a.decimals))
                const zBalance = toZero(formatBalance(z.balance, z.decimals))

                const aUSD = toZero(a.value?.[CurrencyType.USD] ?? '0')
                const zUSD = toZero(z.value?.[CurrencyType.USD] ?? '0')

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
    }, [account, chainId, hub, trustedTokens, blockedTokens, Others])
}
