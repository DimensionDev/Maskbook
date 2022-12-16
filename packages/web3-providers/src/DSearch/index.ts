import urlcat from 'urlcat'
import { uniqWith } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    SearchResult,
    SearchResultType,
    DomainResult,
    FungibleTokenResult,
    NonFungibleTokenResult,
    SourceType,
    NonFungibleCollectionResult,
    EOAResult,
    attemptUntil,
    isSameAddress,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import {
    ChainId as ChainIdEVM,
    AddressType,
    isValidAddress as isValidAddressEVM,
    isZeroAddress as isZeroAddressEVM,
    isValidDomain as isValidDomainEVM,
} from '@masknet/web3-shared-evm'
import {
    isValidAddress as isValidAddressFlow,
    isZeroAddress as isZeroAddressFlow,
    isValidDomain as isValidDomainFlow,
} from '@masknet/web3-shared-flow'
import {
    isValidAddress as isValidAddressSolana,
    isZeroAddress as isZeroAddressSolana,
    isValidDomain as isValidDomainSolana,
} from '@masknet/web3-shared-solana'
import { fetchCached } from '../entry-helpers.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { CoinGeckoSearchAPI } from '../CoinGecko/apis/DSearchAPI.js'
import { CoinMarketCapSearchAPI } from '../CoinMarketCap/DSearchAPI.js'
import { NFTScanSearchAPI } from '../NFTScan/index.js'
import type { DSearchBaseAPI } from '../types/DSearch.js'
import { getHandlers } from './rules.js'
import { ENS, SpaceID, ChainbaseDomain, CoinGeckoTrending } from '../entry.js'

import { DSEARCH_BASE_URL } from './constants.js'
import { Web3API } from '../EVM/index.js'

const CHAIN_ID_LIST = [ChainIdEVM.Mainnet, ChainIdEVM.BSC, ChainIdEVM.Matic]

const isValidAddress = (address?: string): boolean => {
    return isValidAddressEVM(address) || isValidAddressFlow(address) || isValidAddressSolana(address)
}

const isZeroAddress = (address?: string): boolean => {
    return isZeroAddressEVM(address) || isZeroAddressFlow(address) || isZeroAddressSolana(address)
}

const isValidDomain = (domain?: string): boolean => {
    return isValidDomainEVM(domain) || isValidDomainFlow(domain) || isValidDomainSolana(domain)
}

export class DSearchAPI<ChainId = Web3Helper.ChainIdAll, SchemaType = Web3Helper.SchemaTypeAll>
    implements DSearchBaseAPI.Provider<ChainId, SchemaType, NetworkPluginID>
{
    private handlers = getHandlers<ChainId, SchemaType>()

    private Web3 = new Web3API()

    private NFTScanClient = new NFTScanSearchAPI<ChainId, SchemaType>()
    private CoinGeckoClient = new CoinGeckoSearchAPI<ChainId, SchemaType>()
    private CoinMarketCapClient = new CoinMarketCapSearchAPI<ChainId, SchemaType>()

    private parseKeyword(keyword: string): { word: string; field?: string } {
        const words = keyword.split(':')
        if (words.length === 1) {
            return {
                word: words[0],
            }
        }
        return {
            word: words[1],
            field: words[0],
        }
    }

    private async init() {
        const tokenSpecificList = urlcat(DSEARCH_BASE_URL, '/fungible-tokens/specific-list.json')
        const nftSpecificList = urlcat(DSEARCH_BASE_URL, '/non-fungible-tokens/specific-list.json')
        const collectionSpecificList = urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/specific-list.json')

        const tokensRequest = fetchJSON<Array<FungibleTokenResult<ChainId, SchemaType>>>(
            tokenSpecificList,
            undefined,
            fetchCached,
        )
        const nftsRequest = fetchJSON<Array<NonFungibleTokenResult<ChainId, SchemaType>>>(
            nftSpecificList,
            undefined,
            fetchCached,
        )
        const collectionsRequest = fetchJSON<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
            collectionSpecificList,
            undefined,
            fetchCached,
        )

        const NFTScanRequest = this.NFTScanClient.get()
        const CoinGeckoRequest = this.CoinGeckoClient.get()
        const CoinMarketCapRequest = this.CoinMarketCapClient.get()

        return (
            await Promise.allSettled([
                tokensRequest,
                nftsRequest,
                collectionsRequest,
                NFTScanRequest,
                CoinMarketCapRequest,
                CoinGeckoRequest,
            ])
        )
            .map((v) => (v.status === 'fulfilled' && v.value ? v.value : []))
            .flat()
    }

    private async searchDomain(domain: string): Promise<Array<DomainResult<ChainId>>> {
        const [address, chainId] = await attemptUntil(
            [
                () => ENS.lookup(ChainIdEVM.Mainnet, domain).then((x) => [x, ChainIdEVM.Mainnet]),
                () => ChainbaseDomain.lookup(ChainIdEVM.Mainnet, domain).then((x) => [x, ChainIdEVM.Mainnet]),
                () => SpaceID.lookup(ChainIdEVM.BSC, domain).then((x) => [x, ChainIdEVM.BSC]),
            ],
            ['', ChainIdEVM.Mainnet],
        )
        if (!isValidAddressEVM(address)) return EMPTY_LIST

        return [
            {
                type: SearchResultType.Domain,
                domain,
                address,
                keyword: domain,
                chainId,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            } as DomainResult<ChainId>,
        ]
    }

    /**
     *
     * Search DSearch token info
     * @param keyword A hint for searching the localKey.
     * @returns SearchResult List
     *
     * params e.g.
     * "eth"
     * "token:eth"
     * "collection:punk"
     * "twitter:mask"
     * "address:0x"
     *
     */
    private async searchToken(keyword: string): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const { word, field } = this.parseKeyword(keyword)
        const data = (await this.init()) as Array<
            FungibleTokenResult<ChainId, SchemaType> | NonFungibleTokenResult<ChainId, SchemaType>
        >

        let result: Array<FungibleTokenResult<ChainId, SchemaType> | NonFungibleTokenResult<ChainId, SchemaType>> = []

        if (isValidAddress?.(keyword)) {
            const list = data
                .filter((x) => isSameAddress(keyword, x.address))
                .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

            if (list.length > 0) return [list[0]]

            const coinInfo = await CoinGeckoTrending.getCoinInfoByAddress(keyword)

            if (coinInfo?.id) {
                return [
                    {
                        type: SearchResultType.FungibleToken,
                        id: coinInfo.id,
                        source: SourceType.CoinGecko,
                        keyword,
                        pluginID: NetworkPluginID.PLUGIN_EVM,
                    } as FungibleTokenResult<ChainId, SchemaType>,
                ]
            }
        }

        for (const { rules, type } of this.handlers) {
            for (const rule of rules) {
                if (field !== undefined && rule.key !== field) continue
                const filtered = data.filter((x) => (type ? type === x.type : true))

                if (rule.type === 'exact') {
                    const item = filtered.find((x) => rule.filter?.(x, word, filtered)) as
                        | FungibleTokenResult<ChainId, SchemaType>
                        | NonFungibleTokenResult<ChainId, SchemaType>
                    if (item) {
                        const exactData = { ...item, keyword: word }

                        if (!field) {
                            result = [...result, exactData]
                        } else {
                            return [exactData]
                        }
                    }
                }
                if (rule.type === 'fuzzy') {
                    const items = (rule.fullSearch?.(word, filtered) ?? []) as Array<
                        FungibleTokenResult<ChainId, SchemaType> | NonFungibleTokenResult<ChainId, SchemaType>
                    >
                    const fuzzyData = items.map((x) => ({ ...x, keyword: word }))
                    if (!field) {
                        result = [...result, ...fuzzyData]
                    } else {
                        if (items.length) return fuzzyData
                    }
                }
            }
        }

        return uniqWith(
            result,
            (a, b) => a.type === b.type && (a.id === b.id || isSameAddress(a.address, b.address)),
        ).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    }

    async search(keyword: string): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const [, , trendingTokenName = ''] = keyword.match(/([#$])(\w+)/) ?? []
        if (trendingTokenName) return this.searchToken(trendingTokenName)

        const { word, field } = this.parseKeyword(keyword)
        if (word && field === 'token') return this.searchToken(keyword)

        if (isValidDomain(keyword)) return this.searchDomain(keyword)

        if (isValidAddress?.(keyword) && !isZeroAddress?.(keyword)) {
            const list = await this.searchToken(keyword)
            if (list.length > 0) return list

            const addressType = await attemptUntil(
                CHAIN_ID_LIST.map((chainId) => async () => {
                    const type = await this.Web3.getAddressType(chainId, keyword)
                    if (type !== AddressType.Contract) return
                    return type
                }),
                undefined,
            )

            if (addressType !== AddressType.Contract) {
                const domain = await attemptUntil(
                    [ENS, ChainbaseDomain, SpaceID].map((x) => async () => {
                        return x.reverse(ChainIdEVM.Mainnet, keyword)
                    }),
                    '',
                )
                return [
                    {
                        type: SearchResultType.EOA,
                        address: keyword,
                        domain,
                        keyword,
                        pluginID: NetworkPluginID.PLUGIN_EVM,
                    } as EOAResult<ChainId>,
                ]
            }

            // todo: query fungible token by coingecko
        }

        return EMPTY_LIST
    }
}
