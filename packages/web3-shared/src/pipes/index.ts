import { unreachable } from '@dimensiondev/kit'
import {
    ChainId,
    ERC20Token,
    ERC721Token,
    NativeToken,
    NetworkType,
    ERC721TokenDetailed,
    ProviderType,
    CollectibleProvider,
} from '../types'
import { getChainDetailed, createLookupTableResolver } from '../utils'
import urlcat from 'urlcat'

export const resolveProviderName = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.MaskWallet]: 'Mask',
        [ProviderType.MetaMask]: 'MetaMask',
        [ProviderType.WalletConnect]: 'WalletConnect',
        [ProviderType.CustomNetwork]: 'CustomNetwork',
    },
    'Unknown Network',
)

export const resolveNetworkAddressPrefix = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'ethereum',
        [NetworkType.Binance]: 'binance',
        [NetworkType.Polygon]: 'polygon',
        [NetworkType.Arbitrum]: 'arbitrum',
        [NetworkType.xDai]: 'xdai',
    },
    'ethereum',
)

export const resolveNetworkName = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Binance]: 'Binance Smart Chain',
        [NetworkType.Polygon]: 'Polygon',
        [NetworkType.Ethereum]: 'Ethereum',
        [NetworkType.Arbitrum]: 'Arbitrum',
        [NetworkType.xDai]: 'xDai',
    },
    'Unknown',
)

export function resolveChainName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.name ?? 'Unknown'
}

export function resolveChainFullName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.fullName ?? 'Unknown'
}

export const resolveChainColor = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Mainnet]: 'rgb(28, 104, 243)',
        [ChainId.Ropsten]: 'rgb(255, 65, 130)',
        [ChainId.Kovan]: 'rgb(133, 89,255)',
        [ChainId.Rinkeby]: 'rgb(133, 89, 255)',
        [ChainId.Gorli]: 'rgb(48, 153, 242)',
        [ChainId.BSC]: 'rgb(240, 185, 10)',
        [ChainId.BSCT]: 'rgb(240, 185, 10)',
        [ChainId.Matic]: 'rgb(119, 62, 225)',
        [ChainId.Mumbai]: 'rgb(130, 71, 229)',
        [ChainId.Arbitrum]: 'rgb(36, 150, 238)',
        [ChainId.Arbitrum_Rinkeby]: 'rgb(36, 150, 238)',
        [ChainId.xDai]: 'rgb(73, 169, 166)',
    },
    'rgb(214, 217, 220)',
)

export function resolveLinkOnExplorer(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return ''
    return chainDetailed.explorers?.[0]?.url ?? chainDetailed.infoURL
}

export function resolveTransactionLinkOnExplorer(chainId: ChainId, tx: string) {
    return urlcat(resolveLinkOnExplorer(chainId), '/tx/:tx', { tx })
}

export function resolveTokenLinkOnExplorer({ chainId, address }: NativeToken | ERC20Token | ERC721Token) {
    return urlcat(resolveLinkOnExplorer(chainId), '/token/:address', { address })
}

export function resolveAddressLinkOnExplorer(chainId: ChainId, address: string): string {
    return urlcat(resolveLinkOnExplorer(chainId), '/address/:address', { address })
}

export function resolveBlockLinkOnExplorer(chainId: ChainId, block: string): string {
    return urlcat(resolveLinkOnExplorer(chainId), '/block/:block', { block })
}

export function resolveIPFSLink(ipfs: string): string {
    return urlcat('https://ipfs.fleek.co/ipfs/:ipfs', { ipfs })
}

export function resolveCollectibleProviderLink(chainId: ChainId, provider: CollectibleProvider) {
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            if (chainId === ChainId.Rinkeby) return `https://testnets.opensea.io`
            return `https://opensea.io`
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleLink(
    chainId: ChainId,
    provider: CollectibleProvider,
    { contractDetailed: { address }, tokenId }: ERC721TokenDetailed,
) {
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            return urlcat(resolveCollectibleProviderLink(chainId, provider), '/assets/:address/:tokenId', {
                address,
                tokenId,
            })
        default:
            unreachable(provider)
    }
}

export function resolveOpenSeaLink(address: string, tokenId: string) {
    return urlcat('https://opensea.io/assets/:address/:tokenId', {
        address,
        tokenId,
    })
}
