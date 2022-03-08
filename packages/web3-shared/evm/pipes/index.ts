import urlcat from 'urlcat'
import { unreachable } from '@dimensiondev/kit'
import {
    ChainId,
    ERC20Token,
    ERC721Token,
    NativeToken,
    NetworkType,
    ProviderType,
    NonFungibleAssetProvider,
    ERC721TokenDetailed,
} from '../types'
import { getChainDetailed, createLookupTableResolver } from '../utils'

export const resolveProviderName = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.MaskWallet]: 'Mask Network',
        [ProviderType.MetaMask]: 'MetaMask',
        [ProviderType.WalletConnect]: 'WalletConnect',
        [ProviderType.CustomNetwork]: 'CustomNetwork',
        [ProviderType.Coin98]: 'Coin98',
        [ProviderType.WalletLink]: 'Coinbase',
        [ProviderType.MathWallet]: 'MathWallet',
        [ProviderType.Fortmatic]: 'Fortmatic',
    },
    'Unknown Network',
)

export const resolveProviderShortenLink = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.MaskWallet]: 'Mask.io',
        [ProviderType.MetaMask]: 'Metamask.io',
        [ProviderType.WalletConnect]: 'Walletconnect.com',
        [ProviderType.CustomNetwork]: 'Website',
        [ProviderType.Coin98]: 'Coin98.com',
        [ProviderType.WalletLink]: 'Walletlink.org',
        [ProviderType.MathWallet]: 'Mathwallet.org',
        [ProviderType.Fortmatic]: 'Fortmatic.com',
    },
    'website',
)

export const resolveProviderHomeLink = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.MaskWallet]: 'https://mask.io',
        [ProviderType.MetaMask]: 'https://metamask.io',
        [ProviderType.WalletConnect]: 'https://walletconnect.com',
        [ProviderType.CustomNetwork]: '',
        [ProviderType.Coin98]: 'https://coin98.com',
        [ProviderType.WalletLink]: 'https://walletlink.org',
        [ProviderType.MathWallet]: 'https://mathwallet.org',
        [ProviderType.Fortmatic]: 'https://fortmatic.com',
    },
    '',
)

export const resolveProviderDownloadLink = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.MaskWallet]: 'https://mask.io/download-links',
        [ProviderType.MetaMask]: 'https://metamask.io/download.html',
        [ProviderType.WalletConnect]: '',
        [ProviderType.Coin98]: 'https://coin98insights.com/introduction-to-coin98-wallet-extension',
        [ProviderType.WalletLink]: 'https://wallet.coinbase.com/',
        [ProviderType.MathWallet]: 'https://mathwallet.org/en-us/#extension',
        [ProviderType.Fortmatic]: '',
        [ProviderType.CustomNetwork]: '',
    },
    '',
)

export const resolveProviderInjectedKey = createLookupTableResolver<
    ProviderType,
    'isMaskWallet' | 'isMetaMask' | 'isMathWallet' | 'isCoin98' | 'isWalletLink' | ''
>(
    {
        [ProviderType.MaskWallet]: 'isMaskWallet',
        [ProviderType.MetaMask]: 'isMetaMask',
        [ProviderType.WalletConnect]: '',
        [ProviderType.MathWallet]: 'isMathWallet',
        [ProviderType.Coin98]: 'isCoin98',
        [ProviderType.WalletLink]: 'isWalletLink',
        [ProviderType.Fortmatic]: '',
        [ProviderType.CustomNetwork]: '',
    },
    '',
)

export const resolveNetworkAddressPrefix = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'ethereum',
        [NetworkType.Binance]: 'binance',
        [NetworkType.Polygon]: 'polygon',
        [NetworkType.Arbitrum]: 'arbitrum',
        [NetworkType.xDai]: 'xdai',
        [NetworkType.Avalanche]: 'avalanche',
        [NetworkType.Celo]: 'celo',
        [NetworkType.Fantom]: 'fantom',
        [NetworkType.Aurora]: 'Aurora',
        [NetworkType.Moonbeam]: 'Moonbeam',
    },
    'ethereum',
)

export const resolveNetworkName = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'Ethereum',
        [NetworkType.Binance]: 'Binance Smart Chain',
        [NetworkType.Polygon]: 'Polygon',
        [NetworkType.Arbitrum]: 'Arbitrum',
        [NetworkType.xDai]: 'xDai',
        [NetworkType.Avalanche]: 'Avalanche',
        [NetworkType.Celo]: 'Celo',
        [NetworkType.Fantom]: 'Fantom',
        [NetworkType.Aurora]: 'Aurora',
        [NetworkType.Moonbeam]: 'Moonbeam',
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
        [ChainId.Avalanche]: 'rgb(232, 65, 66)',
        [ChainId.Avalanche_Fuji]: 'rgb(232, 65, 66)',
        [ChainId.Celo]: 'rgb(53, 208, 127)',
        [ChainId.Fantom]: 'rgb(19, 181, 236)',
        [ChainId.Aurora]: 'rgb(112, 212, 74)',
        [ChainId.Aurora_Testnet]: 'rgb(112, 212, 74)',
        [ChainId.Moonbeam]: 'rgb(127, 39, 88)',
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
    return urlcat('https://coldcdn.com/api/cdn/mipfsygtms/ipfs/:ipfs', { ipfs })
}

export function resolveResourceLink(originLink: string): string {
    if (!originLink) return ''
    if (originLink.startsWith('http') || originLink.startsWith('data')) return originLink
    if (originLink.startsWith('ipfs://ipfs/')) return resolveIPFSLink(originLink.replace(/^ipfs:\/\/ipfs\//, ''))
    if (originLink.startsWith('ipfs://')) return resolveIPFSLink(decodeURIComponent(originLink).replace('ipfs://', ''))
    return resolveIPFSLink(originLink)
}

export function resolveDomainLink(domain?: string) {
    if (!domain) return ''
    return urlcat('https://app.ens.domains/name/:domain/details', { domain })
}

export function resolveCollectibleProviderLink(chainId: ChainId, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            if (chainId === ChainId.Rinkeby) return 'https://testnets.opensea.io'
            return 'https://opensea.io'
        case NonFungibleAssetProvider.RARIBLE:
            return 'https://rarible.com'
        case NonFungibleAssetProvider.NFTSCAN:
            return 'https://nftscan.com'
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleAssetLink(chainId: ChainId, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            if (chainId === ChainId.Rinkeby) return 'https://testnets.opensea.io/assets'
            if (chainId === ChainId.Matic) return 'https://opensea.io/assets/matic'
            return 'https://opensea.io/assets'
        case NonFungibleAssetProvider.RARIBLE:
            return ''
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleLink(
    chainId: ChainId,
    provider: NonFungibleAssetProvider,
    { contractDetailed: { address }, tokenId }: ERC721TokenDetailed,
) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return urlcat(resolveCollectibleAssetLink(chainId, provider), '/:address/:tokenId', {
                address,
                tokenId,
            })
        case NonFungibleAssetProvider.RARIBLE:
            return ''
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
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
