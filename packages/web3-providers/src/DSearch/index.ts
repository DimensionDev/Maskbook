import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Web3Bio } from '@masknet/web3-providers'
import {
    attemptUntil,
    type DomainResult,
    type EOAResult,
    type FungibleTokenResult,
    isSameAddress,
    type NonFungibleCollectionResult,
    type NonFungibleTokenResult,
    type SearchResult,
    SearchResultType,
    SourceType,
} from '@masknet/web3-shared-base'
import {
    ChainId as ChainIdEVM,
    isValidAddress as isValidAddressEVM,
    isValidDomain as isValidDomainEVM,
    isZeroAddress as isZeroAddressEVM,
} from '@masknet/web3-shared-evm'
import {
    isValidAddress as isValidAddressFlow,
    isValidDomain as isValidDomainFlow,
    isZeroAddress as isZeroAddressFlow,
} from '@masknet/web3-shared-flow'
import {
    isValidAddress as isValidAddressSolana,
    isValidDomain as isValidDomainSolana,
    isZeroAddress as isZeroAddressSolana,
} from '@masknet/web3-shared-solana'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { uniqWith } from 'lodash-es'
import urlcat from 'urlcat'
import { ARBID } from '../ARBID/index.js'
import { CoinGeckoSearchAPI } from '../CoinGecko/apis/DSearchAPI.js'
import { CoinGeckoTrending } from '../CoinGecko/apis/TrendingAPI.js'
import { ENS } from '../ENS/index.js'
import { NFTScanCollectionSearchAPI, NFTScanSearchAPI } from '../NFTScan/apis/DSearchAPI.js'
import { PlatformToChainIdMap } from '../RSS3/constants.js'
import { RSS3 } from '../RSS3/index.js'
import { SpaceID } from '../SpaceID/index.js'
import { DSEARCH_BASE_URL } from './constants.js'
import { fetchFromDSearch } from './helpers.js'
import { getHandlers } from './rules.js'

function isValidAddress(address?: string): boolean {
    return isValidAddressEVM(address) || isValidAddressFlow(address) || isValidAddressSolana(address)
}

function isZeroAddress(address?: string): boolean {
    return isZeroAddressEVM(address) || isZeroAddressFlow(address) || isZeroAddressSolana(address)
}

function isValidDomain(domain?: string): boolean {
    return isValidDomainEVM(domain) || isValidDomainFlow(domain) || isValidDomainSolana(domain)
}

const handleRe = new RegExp(
    `\\.(${[
        'avax',
        'csb',
        'bit',
        'eth',
        'arb',
        'lens',
        'bnb',
        'crypto',
        'nft',
        'x',
        'wallet',
        'bitcoin',
        'dao',
        '888',
        'zil',
        'blockchain',
    ].join('|')})$`,
    'i',
)

function isValidHandle(handle: string): boolean {
    return handleRe.test(handle)
}

class DSearchAPI<ChainId = Web3Helper.ChainIdAll, SchemaType = Web3Helper.SchemaTypeAll> {
    private NFTScanClient = new NFTScanSearchAPI<ChainId, SchemaType>()
    private NFTScanCollectionClient = new NFTScanCollectionSearchAPI<ChainId, SchemaType>()
    private CoinGeckoClient = new CoinGeckoSearchAPI<ChainId, SchemaType>()

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

    private async searchDomain(domain: string): Promise<Array<DomainResult<ChainId>>> {
        // only EVM domains
        if (!isValidDomainEVM(domain)) return EMPTY_LIST

        const [address, chainId] = await attemptUntil(
            [
                () =>
                    ENS.lookup(domain).then((x = '') => {
                        if (!x || isZeroAddressEVM(x)) throw new Error(`No result for ${domain}`)
                        return [x, ChainIdEVM.Mainnet]
                    }),
                () =>
                    SpaceID.lookup(domain).then((x = '') => {
                        if (!x || isZeroAddressEVM(x)) throw new Error(`No result for ${domain}`)
                        return [x, ChainIdEVM.BSC]
                    }),
                () =>
                    ARBID.lookup(domain).then((x = '') => {
                        if (!x || isZeroAddressEVM(x)) throw new Error(`No result for ${domain}`)
                        return [x, ChainIdEVM.Arbitrum]
                    }),
            ],
            ['', ChainIdEVM.Mainnet],
        )

        if (!isValidAddressEVM(address) || isZeroAddressEVM(address)) return EMPTY_LIST

        return [
            {
                type: SearchResultType.Domain,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: chainId as ChainId,
                keyword: domain,
                domain,
                address,
            },
        ]
    }

    private async searchRSS3Handle(handle: string): Promise<Array<DomainResult<ChainId>>> {
        const profiles = await RSS3.getProfiles(handle)
        return profiles
            .filter((x) => x.handle === handle)
            .map((profile) => {
                const chainId = PlatformToChainIdMap[profile.network] as ChainId
                if (!chainId) console.error(`Not chain id configured for network ${profile.network}`)

                return {
                    type: SearchResultType.Domain,
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    chainId,
                    keyword: handle,
                    domain: profile.handle,
                    address: profile.address,
                }
            })
    }

    private async searchRSS3NameService(handle: string): Promise<Array<DomainResult<ChainId>>> {
        const result = await RSS3.getNameService(handle)
        if (!result) return []
        return [
            {
                type: SearchResultType.Domain,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: result.chainId as ChainId,
                keyword: handle,
                domain: handle,
                address: result.address,
            },
        ]
    }

    private async searchAddress(address: string): Promise<Array<EOAResult<ChainId>>> {
        // only EVM address
        if (!isValidAddressEVM(address)) return EMPTY_LIST

        const [domain, chainId] = await attemptUntil(
            [
                () => ENS.reverse(address).then((x) => [x, ChainIdEVM.Mainnet]),
                () => SpaceID.reverse(address).then((x) => [x, ChainIdEVM.BSC]),
                () => ARBID.reverse(address).then((x) => [x, ChainIdEVM.Arbitrum]),
            ],
            ['', ChainIdEVM.Mainnet],
        )

        return [
            {
                type: SearchResultType.EOA,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: chainId as ChainId,
                keyword: address,
                domain: isValidDomainEVM(domain) ? domain : undefined,
                address,
                web3bioProfiles: await Web3Bio.getProfilesBy(address),
            },
        ]
    }

    private async searchTokens() {
        const specificTokens = (
            await Promise.allSettled([
                fetchFromDSearch<Array<FungibleTokenResult<ChainId, SchemaType>>>(
                    urlcat(DSEARCH_BASE_URL, '/fungible-tokens/specific-list.json'),
                    { mode: 'cors' },
                ),
                fetchFromDSearch<Array<NonFungibleTokenResult<ChainId, SchemaType>>>(
                    urlcat(DSEARCH_BASE_URL, '/non-fungible-tokens/specific-list.json'),
                    { mode: 'cors' },
                ),
                fetchFromDSearch<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
                    urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/specific-list.json'),
                    { mode: 'cors' },
                ),
            ])
        ).flatMap(
            (v) =>
                (v.status === 'fulfilled' && v.value ? v.value : []) as Array<
                    | FungibleTokenResult<ChainId, SchemaType>
                    | NonFungibleTokenResult<ChainId, SchemaType>
                    | NonFungibleCollectionResult<ChainId, SchemaType>
                >,
        )

        const normalTokens = (await Promise.allSettled([this.NFTScanClient.get(), this.CoinGeckoClient.get()])).flatMap(
            (v) => {
                return (v.status === 'fulfilled' && v.value ? v.value : []) as Array<
                    | FungibleTokenResult<ChainId, SchemaType>
                    | NonFungibleTokenResult<ChainId, SchemaType>
                    | NonFungibleCollectionResult<ChainId, SchemaType>
                >
            },
        )

        return {
            specificTokens,
            normalTokens,
        }
    }

    private async searchTokenByAddress(address: string): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const { specificTokens, normalTokens } = await this.searchTokens()

        const specificTokensFiltered = specificTokens
            .filter((x) => {
                return (
                    isSameAddress(address, x.address) &&
                    (x.type === SearchResultType.FungibleToken ||
                        x.type === SearchResultType.NonFungibleToken ||
                        x.type === SearchResultType.CollectionListByTwitterHandle)
                )
            })
            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

        const normalTokensFiltered = normalTokens
            .filter((x) => {
                return (
                    isSameAddress(address, x.address) &&
                    (x.type === SearchResultType.FungibleToken ||
                        x.type === SearchResultType.NonFungibleToken ||
                        x.type === SearchResultType.CollectionListByTwitterHandle)
                )
            })
            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

        if (specificTokensFiltered.length > 0) return [specificTokensFiltered[0]]

        if (normalTokensFiltered.length > 0) return [normalTokensFiltered[0]]

        const coinInfo = await CoinGeckoTrending.getCoinInfoByAddress(address)

        if (coinInfo?.id) {
            return [
                {
                    type: SearchResultType.FungibleToken,
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    chainId: coinInfo.chainId as ChainId,
                    id: coinInfo.id,
                    source: SourceType.CoinGecko,
                    name: coinInfo.name,
                    // FIXME: symbol is missing
                    symbol: coinInfo.name,
                    keyword: address,
                },
            ]
        }
        return EMPTY_LIST
    }

    private async searchTokenByHandler(
        tokens: Array<
            | FungibleTokenResult<ChainId, SchemaType>
            | NonFungibleTokenResult<ChainId, SchemaType>
            | NonFungibleCollectionResult<ChainId, SchemaType>
        >,
        name: string,
    ): Promise<
        Array<
            | FungibleTokenResult<ChainId, SchemaType>
            | NonFungibleTokenResult<ChainId, SchemaType>
            | NonFungibleCollectionResult<ChainId, SchemaType>
        >
    > {
        let result: Array<
            | FungibleTokenResult<ChainId, SchemaType>
            | NonFungibleTokenResult<ChainId, SchemaType>
            | NonFungibleCollectionResult<ChainId, SchemaType>
        > = []

        if (name.length < 6) {
            const lowerName = name.toLowerCase()
            result = tokens.filter(
                (t) =>
                    t.symbol?.toLowerCase() === lowerName ||
                    (name.length > 3 && t.name?.toLowerCase().startsWith(lowerName) && t.rank && t.rank <= 20) ||
                    t.alias?.map((x) => x.value.toLowerCase()).includes(lowerName),
            )
        }

        if (!result.length) {
            for (const { rules, types } of getHandlers<ChainId, SchemaType>()) {
                for (const rule of rules) {
                    if (!['token', 'twitter'].includes(rule.key)) continue

                    const filtered = tokens.filter((x) => (types ? types.includes(x.type) : true))
                    if (rule.type === 'exact') {
                        const item = filtered.find((x) => rule.filter?.(x, name, filtered))
                        if (item) result = [...result, { ...item, keyword: name }]
                    }
                    if (rule.type === 'fuzzy' && rule.fullSearch) {
                        const items = rule
                            .fullSearch<
                                | FungibleTokenResult<ChainId, SchemaType>
                                | NonFungibleTokenResult<ChainId, SchemaType>
                                | NonFungibleCollectionResult<ChainId, SchemaType>
                            >(name, filtered)
                            .map((x) => ({ ...x, keyword: name }))
                        if (items.length) result = [...result, ...items]
                    }
                }
            }
        }
        return result.sort((a, b) => {
            if (
                a.rank &&
                a.rank <= 200 &&
                a.type === SearchResultType.FungibleToken &&
                b.type !== SearchResultType.FungibleToken
            )
                return -1

            return (a.rank ?? 0) - (b.rank ?? 0)
        })
    }

    private async searchTokenByName(name: string): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const { specificTokens, normalTokens } = await this.searchTokens()
        const specificResult_ = await this.searchTokenByHandler(
            specificTokens.map((x) => ({ ...x, alias: x.alias?.filter((x) => !x.isPin) })),
            name,
        )
        const normalResult = await this.searchTokenByHandler([...specificTokens, ...normalTokens], name)

        const specificResult: Array<
            | FungibleTokenResult<ChainId, SchemaType>
            | NonFungibleTokenResult<ChainId, SchemaType>
            | NonFungibleCollectionResult<ChainId, SchemaType>
        > = specificResult_.map((x) => {
            const r = normalTokens.find((y) => isSameAddress(y.address, x.address) && x.chainId === y.chainId)
            return { ...x, rank: r?.rank }
        })

        return uniqWith(specificResult.concat(normalResult), (a, b) => a.id === b.id)
    }

    private async searchCollectionListByTwitterHandle(
        twitterHandle: string,
    ): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const collections = uniqWith(
            (await Promise.allSettled([this.CoinGeckoClient.get(), this.NFTScanCollectionClient.get()]))
                .flatMap(
                    (v) =>
                        (v.status === 'fulfilled' && v.value ? v.value : []) as Array<
                            FungibleTokenResult<ChainId, SchemaType> | NonFungibleCollectionResult<ChainId, SchemaType>
                        >,
                )
                .filter((x) => {
                    const resultTwitterHandle =
                        (x as NonFungibleCollectionResult<ChainId, SchemaType>).collection?.socialLinks?.twitter ||
                        (x as FungibleTokenResult<ChainId, SchemaType>).socialLinks?.twitter
                    if (!resultTwitterHandle) return false
                    const handle = twitterHandle.toLowerCase()
                    return (
                        [handle, `https://twitter.com/${handle}`, `https://x.com/${handle}`].includes(
                            resultTwitterHandle.toLowerCase(),
                        ) &&
                        ((x.rank && x.rank <= 500) || x.id === 'mask-network')
                    )
                })
                .sort((a, b) => (a.rank || 0) - (b.rank || 0)),
            (a, b) => a.id === b.id,
        )

        if (!collections[0]) return EMPTY_LIST

        return collections
    }

    /**
     * The entry point of DSearch
     * @param keyword
     * @returns
     */
    async search<T extends SearchResult<ChainId, SchemaType> = SearchResult<ChainId, SchemaType>>(
        keyword_: string,
        type?: SearchResultType,
    ): Promise<T[]> {
        const keyword = keyword_.toLowerCase()
        // filter out 'domain/xxx' or string ends with punctuation marks like 'eth.'
        if (keyword.replace(/([#$])?([\s\w+.])+/, '').length > 0 || !new RegExp(/(\w)+/).test(keyword.at(-1)!))
            return EMPTY_LIST
        // #MASK or $MASK or MASK
        const [_, name = ''] = keyword.match(/(\w+)/) ?? []

        // BoredApeYC or CryptoPunks nft twitter project
        if (type === SearchResultType.CollectionListByTwitterHandle)
            return this.searchCollectionListByTwitterHandle(keyword) as Promise<T[]>

        // token:MASK
        const { word, field } = this.parseKeyword(keyword)
        if (word && ['token', 'twitter'].includes(field ?? '')) return this.searchTokenByName(word) as Promise<T[]>

        // vitalik.lens, vitalik.bit, etc. including ENS BNB
        // Can't get .bit domain via RSS3 profile API.
        if (isValidHandle(keyword) && !keyword.endsWith('.bit')) {
            if (keyword.endsWith('.eth')) Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineDsearchEns)
            else Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineDsearchName)
            const domains = (await this.searchRSS3Handle(keyword)) as T[]
            if (domains.length) return domains
        }
        if (keyword.endsWith('.bit')) {
            Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineDsearchName)
            return this.searchRSS3NameService(keyword) as Promise<T[]>
        }
        // vitalik.eth
        if (isValidDomain(keyword)) return this.searchDomain(keyword) as Promise<T[]>

        // 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
        if (isValidAddress(keyword) && !isZeroAddress(keyword)) {
            const tokenList = await this.searchTokenByAddress(keyword)
            if (tokenList.length) return tokenList as T[]

            Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineDsearchAddress)
            const addressList = await this.searchAddress(keyword)
            if (addressList.length) return addressList as T[]
        }

        if (name) return this.searchTokenByName(name) as Promise<T[]>
        return EMPTY_LIST
    }
}
export const DSearch = new DSearchAPI()
