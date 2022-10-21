import urlcat from 'urlcat'
import { ChainDescriptor, CurrencyType, NetworkDescriptor, ProviderDescriptor, SourceType } from '../specs/index.js'
import { NetworkPluginID, createLookupTableResolver, NextIDPlatform } from '@masknet/shared-base'

export interface ExplorerRoutes {
    addressPathname?: string
    blockPathname?: string
    transactionPathname?: string
    domainPathname?: string
    fungibleTokenPathname?: string
    nonFungibleTokenPathname?: string
}

// A workaround for extracting un-exported internal types.
// Learn more https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function
export class Wrapper<ChainId, SchemaType, ProviderType, NetworkType> {
    createChainResolver(descriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>) {
        return createChainResolver(descriptors)
    }
    createExplorerResolver(
        descriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>,
        routes?: ExplorerRoutes,
    ) {
        return createExplorerResolver(descriptors, routes)
    }
    createNetworkResolver(descriptors: Array<NetworkDescriptor<ChainId, NetworkType>>) {
        return createNetworkResolver(descriptors)
    }
    createProviderResolver(descriptors: Array<ProviderDescriptor<ChainId, ProviderType>>) {
        return createProviderResolver(descriptors)
    }
}

export type ReturnChainResolver<ChainId, SchemaType, NetworkType> = ReturnType<
    Wrapper<ChainId, SchemaType, never, NetworkType>['createChainResolver']
>
export type ReturnExplorerResolver<ChainId, SchemaType, NetworkType> = ReturnType<
    Wrapper<ChainId, SchemaType, never, NetworkType>['createExplorerResolver']
>
export type ReturnNetworkResolver<ChainId, NetworkType> = ReturnType<
    Wrapper<ChainId, never, never, NetworkType>['createNetworkResolver']
>
export type ReturnProviderResolver<ChainId, ProviderType> = ReturnType<
    Wrapper<ChainId, never, ProviderType, never>['createProviderResolver']
>

export function createChainResolver<ChainId, SchemaType, NetworkType>(
    descriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>,
) {
    const getChainDescriptor = (chainId?: ChainId) => descriptors.find((x) => x.chainId === chainId)

    return {
        chainId: (name?: string) =>
            name
                ? descriptors.find((x) =>
                      [x.name, x.type as string, x.fullName, x.shortName]
                          .map((x) => x?.toLowerCase())
                          .filter(Boolean)
                          .includes(name?.toLowerCase()),
                  )?.chainId
                : undefined,
        coinMarketCapChainId: (chainId?: ChainId) => getChainDescriptor(chainId)?.coinMarketCapChainId,
        coinGeckoChainId: (chainId?: ChainId) => getChainDescriptor(chainId)?.coinGeckoChainId,
        coinGeckoPlatformId: (chainId?: ChainId) => getChainDescriptor(chainId)?.coinGeckoPlatformId,
        chainName: (chainId?: ChainId) => {
            const descriptor = getChainDescriptor(chainId)
            return descriptor?.name === 'BNB Chain' ? 'BNB' : descriptor?.name
        },
        chainFullName: (chainId?: ChainId) => getChainDescriptor(chainId)?.fullName,
        chainShortName: (chainId?: ChainId) => getChainDescriptor(chainId)?.shortName,
        chainColor: (chainId?: ChainId) => getChainDescriptor(chainId)?.color,
        chainPrefix: (chainId?: ChainId) => 'ETH:',
        networkType: (chainId?: ChainId) => getChainDescriptor(chainId)?.type,
        explorerURL: (chainId?: ChainId) => getChainDescriptor(chainId)?.explorerURL,
        nativeCurrency: (chainId?: ChainId) => getChainDescriptor(chainId)?.nativeCurrency,
        isValid: (chainId?: ChainId, testnet = false) =>
            getChainDescriptor(chainId) && (getChainDescriptor(chainId)?.network === 'mainnet' || testnet),
        isMainnet: (chainId?: ChainId) => getChainDescriptor(chainId)?.network === 'mainnet',
        isSupport: (chainId?: ChainId, feature?: string) =>
            !!(feature && getChainDescriptor(chainId)?.features?.includes(feature)),
    }
}

export function createExplorerResolver<ChainId, SchemaType, NetworkType>(
    descriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>,
    {
        addressPathname = '/address/:address',
        blockPathname = '/block/:blockNumber',
        transactionPathname = '/tx/:id',
        domainPathname = '/address/:domain',
        fungibleTokenPathname = '/address/:address',
        nonFungibleTokenPathname = '/nft/:address/:tokenId',
    }: ExplorerRoutes = {},
) {
    const getExplorerURL = (chainId: ChainId) => {
        const chainDescriptor = descriptors.find((x) => x.chainId === chainId)
        return chainDescriptor?.explorerURL ?? { url: '' }
    }

    return {
        explorerURL: getExplorerURL,
        addressLink: (chainId: ChainId, address: string, tokenId?: string) =>
            urlcat(getExplorerURL(chainId).url, addressPathname, {
                address,
                ...getExplorerURL(chainId)?.parameters,
            }),
        blockLink: (chainId: ChainId, blockNumber: number) =>
            urlcat(getExplorerURL(chainId).url, blockPathname, {
                blockNumber,
                ...getExplorerURL(chainId)?.parameters,
            }),
        transactionLink: (chainId: ChainId, id: string) =>
            urlcat(getExplorerURL(chainId).url, transactionPathname, {
                id,
                ...getExplorerURL(chainId)?.parameters,
            }),
        domainLink: (chainId: ChainId, domain: string) =>
            urlcat(getExplorerURL(chainId).url, domainPathname, {
                domain,
                ...getExplorerURL(chainId)?.parameters,
            }),
        fungibleTokenLink: (chainId: ChainId, address: string) => {
            if (!address) return ''
            return urlcat(getExplorerURL(chainId).url, fungibleTokenPathname, {
                address,
                ...getExplorerURL(chainId)?.parameters,
            })
        },
        nonFungibleTokenLink: (chainId: ChainId, address: string, tokenId: string) => {
            return urlcat(getExplorerURL(chainId).url, nonFungibleTokenPathname, {
                address,
                tokenId,
                ...getExplorerURL(chainId)?.parameters,
            })
        },
    }
}

export function createNetworkResolver<ChainId, NetworkType>(
    descriptors: Array<NetworkDescriptor<ChainId, NetworkType>>,
) {
    const getNetworkDescriptor = (networkType: NetworkType) => descriptors.find((x) => x.type === networkType)
    return {
        networkIcon: (networkType: NetworkType) => getNetworkDescriptor(networkType)?.icon,
        networkIconColor: (networkType: NetworkType) => getNetworkDescriptor(networkType)?.iconColor,
        networkName: (networkType: NetworkType) => getNetworkDescriptor(networkType)?.name,
        networkChainId: (networkType: NetworkType) => getNetworkDescriptor(networkType)?.chainId,
    }
}

export function createProviderResolver<ChainId, ProviderType>(
    descriptors: Array<ProviderDescriptor<ChainId, ProviderType>>,
) {
    const getProviderDescriptor = (providerType: ProviderType) => descriptors.find((x) => x.type === providerType)
    return {
        providerName: (providerType: ProviderType) => getProviderDescriptor(providerType)?.name,
        providerHomeLink: (providerType: ProviderType) => getProviderDescriptor(providerType)?.homeLink,
        providerShortenLink: (providerType: ProviderType) => getProviderDescriptor(providerType)?.shortenLink,
        providerDownloadLink: (providerType: ProviderType) => getProviderDescriptor(providerType)?.downloadLink,
    }
}

export const resolveSourceTypeName = createLookupTableResolver<SourceType, string>(
    {
        [SourceType.DeBank]: 'DeBank',
        [SourceType.Zerion]: 'Zerion',
        [SourceType.RSS3]: 'RSS3',
        [SourceType.CoinMarketCap]: 'CoinMarketCap',
        [SourceType.UniswapInfo]: 'UniswapInfo',
        [SourceType.OpenSea]: 'OpenSea',
        [SourceType.Rarible]: 'Rarible',
        [SourceType.LooksRare]: 'LooksRare',
        [SourceType.NFTScan]: 'NFTScan',
        [SourceType.Zora]: 'Zora',
        [SourceType.Gem]: 'Gem',
        [SourceType.Alchemy_EVM]: 'Alchemy_EVM',
        [SourceType.Alchemy_FLOW]: 'Alchemy_FLOW',
        [SourceType.RaritySniper]: 'RaritySniper',
        [SourceType.TraitSniper]: 'TraitSniper',
        [SourceType.Chainbase]: 'Chainbase',
        [SourceType.X2Y2]: 'X2Y2',
        [SourceType.MagicEden]: 'MagicEden',
        [SourceType.Element]: 'Element',
        [SourceType.Flow]: 'Flow',
        [SourceType.Solana]: 'Solana',
        [SourceType.Solsea]: 'Solsea',
        [SourceType.Solanart]: 'Solanart',
        [SourceType.R2D2]: 'R2D2',
        [SourceType.Rabby]: 'Rabby',
        [SourceType.CoinGecko]: 'CoinGecko',
        [SourceType.CF]: 'CloudFlare',
    },
    (providerType) => {
        throw new Error(`Unknown provider type: ${providerType}.`)
    },
)

export const resolveCurrencyName = createLookupTableResolver<CurrencyType, string>(
    {
        [CurrencyType.BTC]: 'BTC',
        [CurrencyType.NATIVE]: 'ETH',
        [CurrencyType.USD]: 'USD',
    },
    (CurrencyType) => {
        throw new Error(`Unknown currency type: ${CurrencyType}.`)
    },
)

export const resolveNetworkWalletName = createLookupTableResolver<NetworkPluginID, string>(
    {
        [NetworkPluginID.PLUGIN_EVM]: 'EVM wallet',
        [NetworkPluginID.PLUGIN_SOLANA]: 'Solana wallet',
        [NetworkPluginID.PLUGIN_FLOW]: 'Flow wallet',
    },
    (network) => {
        throw new Error(`Unknown network plugin-id: ${network}`)
    },
)

export const resolveNextID_NetworkPluginID = createLookupTableResolver<NextIDPlatform, NetworkPluginID | undefined>(
    {
        [NextIDPlatform.Ethereum]: NetworkPluginID.PLUGIN_EVM,
        [NextIDPlatform.NextID]: undefined,
        [NextIDPlatform.GitHub]: undefined,
        [NextIDPlatform.Keybase]: undefined,
        [NextIDPlatform.Twitter]: undefined,
    },
    (platform) => {
        throw new Error(`Unknown next id platform: ${platform}`)
    },
)

// https://stackoverflow.com/a/67176726
const MATCH_IPFS_CID_RAW =
    'Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[2-7A-Za-z]{58,}|B[2-7A-Z]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[\\dA-F]{50,}'
const MATCH_IPFS_DATA_RE = /ipfs\/(data:.*)$/
const MATCH_IPFS_CID_RE = new RegExp(`(${MATCH_IPFS_CID_RAW})`)
const MATCH_IPFS_CID_STRICT_RE = new RegExp(`^(?:${MATCH_IPFS_CID_RAW})$`)
const MATCH_IPFS_CID_AT_STARTS_RE = new RegExp(`^https://(?:${MATCH_IPFS_CID_RAW})`)
const MATCH_IPFS_CID_AND_PATHNAME_RE = new RegExp(`(?:${MATCH_IPFS_CID_RAW})\\/?.*`)
const MATCH_LOCAL_RESOURCE_URL_RE = /^(data|blob:|\w+-extension:\/\/|<svg\s)/
const CORS_HOST = 'https://cors.r2d2.to'
const IPFS_GATEWAY_HOST = 'https://gateway.ipfscdn.io'

export const isIPFS_CID = (cid: string) => {
    return MATCH_IPFS_CID_STRICT_RE.test(cid)
}

export const isIPFS_Resource = (str: string) => {
    return MATCH_IPFS_CID_RE.test(str)
}

export const isArweaveResource = (str: string) => {
    return str.startsWith('ar:')
}

export const isLocaleResource = (url: string): boolean => {
    return MATCH_LOCAL_RESOURCE_URL_RE.test(url)
}

export const resolveLocalURL = (url: string): string => {
    if (url.startsWith('<svg ')) return `data:image/svg+xml;base64,${btoa(url)}`
    return url
}

/**
 * Remove query from IPFS url, as it is not needed
 * and will increase requests sometimes.
 * For example https://ipfs.io/ipfs/<same-cid>?id=67891 and https://ipfs.io/ipfs/<same-cid>?id=67892
 * are set to two different NFTs, but according to the same CID,
 * they are exactly the same.
 */
const trimQuery = (url: string) => {
    return url.replace(/\?.+$/, '')
}

export const resolveIPFS_CID = (str: string) => {
    return str.match(MATCH_IPFS_CID_RE)?.[1]
}

export function resolveIPFS_URL(cidOrURL: string | undefined): string | undefined {
    if (!cidOrURL) return cidOrURL

    // eliminate cors proxy
    if (cidOrURL.startsWith(CORS_HOST)) {
        return trimQuery(resolveIPFS_URL(decodeURIComponent(cidOrURL.replace(new RegExp(`^${CORS_HOST}\??`), '')))!)
    }

    // a ipfs.io host
    if (cidOrURL.startsWith(IPFS_GATEWAY_HOST)) {
        // base64 data string
        const [_, data] = cidOrURL.match(MATCH_IPFS_DATA_RE) ?? []
        if (data) return decodeURIComponent(data)

        // plain
        return trimQuery(decodeURIComponent(cidOrURL))
    }

    // a ipfs hash fragment
    if (isIPFS_Resource(cidOrURL)) {
        // starts with a cid
        if (MATCH_IPFS_CID_AT_STARTS_RE.test(cidOrURL)) {
            try {
                const u = new URL(cidOrURL)
                const cid = resolveIPFS_CID(cidOrURL)

                if (cid) {
                    if (u.pathname === '/') {
                        return resolveIPFS_URL(
                            urlcat('https://ipfs.io/ipfs/:cid', {
                                cid,
                            }),
                        )
                    } else {
                        return resolveIPFS_URL(
                            urlcat('https://ipfs.io/ipfs/:cid/:path', {
                                cid,
                                path: u.pathname.slice(1),
                            }),
                        )
                    }
                }
            } catch (error) {
                console.log({
                    error,
                })
                // do nothing
            }
        }

        const pathname = cidOrURL.match(MATCH_IPFS_CID_AND_PATHNAME_RE)?.[0]
        if (pathname) return trimQuery(`${IPFS_GATEWAY_HOST}/ipfs/${pathname}`)
    }

    return cidOrURL
}

export function resolveArweaveURL(url: string | undefined) {
    if (!url) return
    if (url.startsWith('https://')) return url
    return urlcat('https://arweave.net/:str', { str: url })
}

export function resolveCrossOriginURL(url: string | undefined) {
    if (!url) return
    if (isLocaleResource(url)) return url
    if (url.startsWith(CORS_HOST)) return url
    return `${CORS_HOST}?${encodeURIComponent(url)}`
}

export function resolveResourceURL(url: string | undefined) {
    if (!url) return url
    if (isLocaleResource(url)) return resolveLocalURL(url)
    if (isArweaveResource(url)) return resolveArweaveURL(url)
    return resolveIPFS_URL(url)
}
