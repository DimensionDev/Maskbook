import urlcat from 'urlcat'
import {
    ChainDescriptor,
    CurrencyType,
    NetworkDescriptor,
    NetworkPluginID,
    ProviderDescriptor,
    SourceType,
} from '../specs'
import { NextIDPlatform } from '@masknet/shared-base'

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

export function createLookupTableResolver<K extends keyof any, T>(map: Record<K, T>, fallback: T | ((key: K) => T)) {
    function resolveFallback(key: K) {
        if (typeof fallback === 'function') return (fallback as (key: K) => T)(key)
        return fallback
    }
    return (key: K) => map[key] ?? resolveFallback(key)
}

export function createChainResolver<ChainId, SchemaType, NetworkType>(
    descriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>,
) {
    const getChainDescriptor = (chainId?: ChainId) => descriptors.find((x) => x.chainId === chainId)

    return {
        chainId: (name?: string) =>
            name
                ? descriptors.find((x) =>
                      [x.name, x.fullName, x.shortName, x.network]
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
        chainNetworkType: (chainId?: ChainId) => getChainDescriptor(chainId)?.type,
        infoURL: (chainId?: ChainId) => getChainDescriptor(chainId)?.explorerURL,
        nativeCurrency: (chainId?: ChainId) => getChainDescriptor(chainId)?.nativeCurrency,
        isValid: (chainId?: ChainId, testnet = false) => getChainDescriptor(chainId)?.network === 'mainnet' || testnet,
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
        addressLink: (chainId: ChainId, address: string) =>
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
        fungibleTokenLink: (chainId: ChainId, address: string) =>
            urlcat(getExplorerURL(chainId).url, fungibleTokenPathname, {
                address,
                ...getExplorerURL(chainId)?.parameters,
            }),
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

export const resolveSourceName = createLookupTableResolver<SourceType, string>(
    {
        [SourceType.DeBank]: 'DeBank',
        [SourceType.Zerion]: 'Zerion',
        [SourceType.RSS3]: 'RSS3',
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

export const resolveNetworkPluginID = createLookupTableResolver<NextIDPlatform, NetworkPluginID | undefined>(
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

const MATCH_IPFS_HASH_RE = /Qm[1-9A-HJ-NP-Za-km-z]{44}/
const MATCH_IPFS_DATA_RE = /ipfs\/(data.*)$/
const MATCH_IPFS_PROTOCOL_RE = /ipfs:\/\/(?:ipfs\/)?/
const CORS_HOST = 'https://cors.r2d2.to'
const IPFS_IO_HOST = 'https://ipfs.io'
const IPFS_PROTOCOL_PREFIX = 'ipfs://'

export function resolveIPFSLink(fragmentOrURL?: string): string | undefined {
    if (!fragmentOrURL) return fragmentOrURL

    // eliminate cors proxy
    if (fragmentOrURL.startsWith(CORS_HOST)) {
        return resolveIPFSLink(decodeURIComponent(fragmentOrURL.replace(new RegExp(`${CORS_HOST}\??`), '')))
    }

    // a ipfs protocol
    if (fragmentOrURL.startsWith(IPFS_PROTOCOL_PREFIX)) {
        return urlcat(`${IPFS_IO_HOST}/ipfs/:hash`, {
            hash: fragmentOrURL.replace(MATCH_IPFS_PROTOCOL_RE, ''),
        })
    }

    // a ipfs.io host
    if (fragmentOrURL.startsWith(IPFS_IO_HOST)) {
        // base64 data string
        const [_, data] = fragmentOrURL.match(MATCH_IPFS_DATA_RE) ?? []
        if (data) return decodeURIComponent(data)

        // plain
        return decodeURIComponent(fragmentOrURL)
    }

    // a ipfs hash fragment
    if (MATCH_IPFS_HASH_RE.test(fragmentOrURL)) {
        return urlcat(`${IPFS_IO_HOST}/ipfs/:hash`, {
            hash: fragmentOrURL,
        })
    }

    return fragmentOrURL
}

export function resolveARLink(str?: string): string {
    if (!str) return ''
    if (str.startsWith('https://')) return str
    return urlcat('https://arweave.net/:str', { str })
}

export function resolveCORSLink(url?: string): string | undefined {
    if (!url) return url
    if (url.startsWith(CORS_HOST)) return url
    return `${CORS_HOST}?${encodeURIComponent(url)}`
}
