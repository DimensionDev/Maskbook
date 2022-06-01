import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray, EMPTY_LIST } from '@masknet/shared-base'
import {
    CurrencyType,
    currySameAddress,
    FungibleAsset,
    isSameAddress,
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3Hub } from './useWeb3Hub'
import { useWeb3State } from './useWeb3State'
import { useFungibleTokens } from './useFungibleTokens'
import { useTrustedFungibleTokens } from './useTrustedFungibleTokens'
import { useBlockedFungibleTokens } from './useBlockedFungibleTokens'

export function useFungibleAssets<T extends NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
    options?: Web3Helper.Web3HubOptions<T>,
) {
    type GetAllFungibleAssets = (
        address: string,
    ) => AsyncIterableIterator<
        FungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >

    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const hub = useWeb3Hub(pluginID, options)
    const trustedTokens = useTrustedFungibleTokens(pluginID)
    const blockedTokens = useBlockedFungibleTokens(pluginID)
    const { Token, Others } = useWeb3State(pluginID) as Web3Helper.Web3StateAll

    return useAsyncRetry(async () => {
        if (!account || !hub) return EMPTY_LIST
        const isTrustedToken = currySameAddress(trustedTokens.map((x) => x.address))
        const isBlockedToken = currySameAddress(blockedTokens.map((x) => x.address))
        const assets = await asyncIteratorToArray((hub?.getAllFungibleAssets as GetAllFungibleAssets)(account))
        const filteredAssets = assets.length && schemaType ? assets.filter((x) => x.schema === schemaType) : assets

        return filteredAssets
            .filter((x) => !isBlockedToken(x))
            .sort((a, z) => {
                const aUSD = Number.parseFloat(a.value?.[CurrencyType.USD] ?? '0')
                const zUSD = Number.parseFloat(z.value?.[CurrencyType.USD] ?? '0')

                const aBalance = Number.parseFloat(a.balance)
                const zBalance = Number.parseFloat(z.balance)

                // the currently selected chain id
                if (a.chainId !== z.chainId) {
                    if (a.chainId === chainId) return -1
                    if (z.chainId === chainId) return 1
                }

                // native token
                if (isSameAddress(a.address, Others?.getNativeTokenAddress(a.chainId))) return -1
                if (isSameAddress(z.address, Others?.getNativeTokenAddress(z.chainId))) return 1

                // mask token with position value
                if (aUSD && isSameAddress(a.address, Others?.getMaskTokenAddress(a.chainId))) return -1
                if (zUSD && isSameAddress(z.address, Others?.getMaskTokenAddress(z.chainId))) return 1

                // token value
                if (aUSD !== zUSD) zUSD - aUSD

                // trusted token
                if (isTrustedToken(a.address)) return -1
                if (isTrustedToken(z.address)) return 1

                // token balance
                if (aBalance !== zBalance) return zBalance - aBalance

                // alphabet
                if (a.name !== z.name) return a.name < z.name ? -1 : 1

                return 0
            })
    }, [account, chainId, hub, trustedTokens, blockedTokens, Others])
}
