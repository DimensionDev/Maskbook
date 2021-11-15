import urlcat from 'urlcat'
import { unreachable } from '@dimensiondev/kit'
import {
    ChainId,
    ERC20Token,
    ERC721Token,
    NativeToken,
    NetworkType,
    ProviderType,
    InjectedProviderType,
    CollectibleProvider,
    ERC721TokenDetailed,
} from '../types'
import { getChainDetailed, createLookupTableResolver } from '../utils'

export const resolveProviderName = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.Injected]: 'Injected Web3',
        [ProviderType.MaskWallet]: 'Mask',
        [ProviderType.MetaMask]: 'MetaMask',
        [ProviderType.WalletConnect]: 'WalletConnect',
        [ProviderType.CustomNetwork]: 'CustomNetwork',
    },
    'Unknown Network',
)

export const resolveInjectedProviderName = createLookupTableResolver<InjectedProviderType, string>(
    {
        [InjectedProviderType.MetaMask]: 'MetaMask (Injected)',
        [InjectedProviderType.MathWallet]: 'MathWallet',
        [InjectedProviderType.Coin98]: 'Coin98',
        [InjectedProviderType.WalletLink]: 'Coinbase',
        [InjectedProviderType.Unknown]: 'Injected Web3',
    },
    'Injected Web3',
)

export const resolveInjectedProviderDownloadLink = createLookupTableResolver<InjectedProviderType, string>(
    {
        [InjectedProviderType.MetaMask]: 'https://metamask.io/download.html',
        [InjectedProviderType.MathWallet]: 'https://mathwallet.org/en-us/#extension',
        [InjectedProviderType.Coin98]: 'https://coin98insights.com/introduction-to-coin98-wallet-extension',
        [InjectedProviderType.WalletLink]: 'https://wallet.coinbase.com/',
        [InjectedProviderType.Unknown]: '',
    },
    '',
)

export const resolveCalculatedProviderName = (
    providerType: ProviderType,
    injectedProviderType?: InjectedProviderType,
) => {
    if (providerType === ProviderType.Injected && injectedProviderType)
        return resolveInjectedProviderName(injectedProviderType)
    return resolveProviderName(providerType)
}

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
        [NetworkType.Ethereum]: 'Ethereum',
        [NetworkType.Binance]: 'Binance Smart Chain',
        [NetworkType.Polygon]: 'Polygon',
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

export function resolveCollectibleAssetLink(chainId: ChainId, provider: CollectibleProvider) {
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            if (chainId === ChainId.Rinkeby) return `https://testnets.opensea.io/assets`
            if (chainId === ChainId.Matic) return `https://opensea.io/assets/matic`
            return `https://opensea.io/assets`
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
            return urlcat(resolveCollectibleAssetLink(chainId, provider), '/:address/:tokenId', {
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
