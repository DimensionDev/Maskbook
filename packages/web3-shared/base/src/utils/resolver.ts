import urlcat from 'urlcat'
import type { ChainDescriptor, NetworkDescriptor, ProviderDescriptor } from '../specs'

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
                          .includes(name),
                  )?.chainId
                : undefined,
        coinMarketCapChainId: (chainId?: ChainId) => getChainDescriptor(chainId)?.coinMarketCapChainId,
        coinGeckoChainId: (chainId?: ChainId) => getChainDescriptor(chainId)?.coinGeckoChainId,
        coinGeckoPlatformId: (chainId?: ChainId) => getChainDescriptor(chainId)?.coinGeckoPlatformId,
        chainName: (chainId?: ChainId) => getChainDescriptor(chainId)?.name,
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

interface ExplorerRoutes {
    addressPathname?: string
    blockPathname?: string
    transactionPathname?: string
    domainPathname?: string
    fungibleTokenPathname?: string
    nonFungibleTokenPathname?: string
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

// A workaround for extracting un-exported internal types.
// Learn more https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function
class Wrapper<ChainId, SchemaType, ProviderType, NetworkType> {
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
