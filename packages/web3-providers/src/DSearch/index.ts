import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    SearchResult,
    SearchResultType,
    DomainResult,
    TrendingTokenByKeywordResult,
    TrendingTokenByAddressResult,
    EOAResult,
    attemptUntil,
} from '@masknet/web3-shared-base'
import { ChainId as ChainIdEVM, AddressType } from '@masknet/web3-shared-evm'
import type { DSearchBaseAPI } from '../types/DSearch.js'

const CHAIN_ID_LIST = [ChainIdEVM.Mainnet, ChainIdEVM.BSC, ChainIdEVM.Matic]

export class DSearchAPI<ChainId = Web3Helper.ChainIdAll> implements DSearchBaseAPI.Provider<ChainId, NetworkPluginID> {
    async search(
        keyword: string,
        options: {
            isValidAddress?: (address?: string) => boolean
            isZeroAddress?: (address?: string) => boolean
            isValidDomain?: (domain?: string) => boolean
            getAddressType?: (
                address: string,
                options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>,
            ) => Promise<AddressType | undefined>
            lookup?: (chainId: ChainIdEVM, domain: string) => Promise<string | undefined>
            reverse?: (chainId: ChainIdEVM, address: string) => Promise<string | undefined>
        },
    ): Promise<SearchResult<ChainId>> {
        const { isValidAddress, isZeroAddress, isValidDomain, getAddressType, lookup, reverse } = options

        const trendingTokenRegexResult = keyword.match(/([#$])(\w+)/) ?? []

        const [_, trendingSearchType, trendingTokenName = ''] = trendingTokenRegexResult

        if (trendingSearchType && trendingTokenName) {
            return {
                type: SearchResultType.TrendingTokenByKeyword,
                domain: keyword,
                trendingSearchType,
                name: trendingTokenName,
                keyword,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            } as TrendingTokenByKeywordResult<ChainId>
        }

        if (isValidDomain?.(keyword)) {
            const address = await lookup?.(ChainIdEVM.Mainnet, keyword)

            return {
                type: SearchResultType.Domain,
                domain: keyword,
                address,
                keyword,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            } as DomainResult<ChainId>
        }

        if (isValidAddress?.(keyword) && !isZeroAddress?.(keyword)) {
            const addressType = await attemptUntil(
                CHAIN_ID_LIST.map((chainId) => async () => {
                    const addressType = await getAddressType?.(keyword, { chainId })
                    if (addressType !== AddressType.Contract) return
                    return addressType
                }),
                undefined,
            )

            if (addressType !== AddressType.Contract) {
                const domain = await reverse?.(ChainIdEVM.Mainnet, keyword)
                return {
                    type: SearchResultType.EOA,
                    address: keyword,
                    domain,
                    keyword,
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                } as EOAResult<ChainId>
            }
            return {
                type: SearchResultType.TrendingTokenByAddress,
                keyword,
            } as TrendingTokenByAddressResult<ChainId>
        }

        return {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            type: SearchResultType.Unknown,
            keyword,
        }
    }
}
