import { safeUnreachable, unreachable } from '@dimensiondev/kit'
import { getTokenConstants } from '../constants'
import {
    ChainId,
    CollectibleProvider,
    ERC20Token,
    ERC721Token,
    NativeToken,
    NetworkType,
    NonFungibleTokenDetailed,
    ProviderType,
} from '../types'
import { formatEthereumAddress, getChainDetailed } from '../utils'

export function resolveProviderName(providerType: ProviderType) {
    switch (providerType) {
        case ProviderType.Maskbook:
            return 'Mask'
        case ProviderType.MetaMask:
            return 'MetaMask'
        case ProviderType.WalletConnect:
            return 'WalletConnect'
        case ProviderType.CustomNetwork:
            return 'CustomNetwork'
        default:
            safeUnreachable(providerType)
            return 'Unknown'
    }
}

export function resolveNetworkAddress(networkType: NetworkType, address: string) {
    switch (networkType) {
        case NetworkType.Binance:
            return `binance:${address}`
        case NetworkType.Polygon:
            return `polygon:${address}`
        case NetworkType.Ethereum:
            return `ethereum:${address}`
        default:
            safeUnreachable(networkType)
            return address
    }
}

export function resolveNetworkName(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Binance:
            return 'Binance Smart Chain'
        case NetworkType.Polygon:
            return 'Polygon'
        case NetworkType.Ethereum:
            return 'Ethereum'
        default:
            safeUnreachable(networkType)
            return 'Unknown'
    }
}

export function resolveChainName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.name ?? 'Unknown'
}

export function resolveChainFullName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.fullName ?? 'Unknown'
}

export function resolveChainColor(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'rgb(41, 182, 175)'
        case ChainId.Ropsten:
            return 'rgb(255, 74, 141)'
        case ChainId.Kovan:
            return 'rgb(112, 87, 255)'
        case ChainId.Rinkeby:
            return 'rgb(246, 195, 67)'
        case ChainId.Gorli:
            return 'rgb(48, 153, 242)'
        default:
            return 'rgb(214, 217, 220)'
    }
}

export function resolveLinkOnExplorer(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return ''
    return chainDetailed.explorers && chainDetailed.explorers.length > 0 && chainDetailed.explorers[0].url
        ? chainDetailed.explorers[0].url
        : chainDetailed.infoURL
}

export function resolveTransactionLinkOnExplorer(chainId: ChainId, tx: string) {
    return `${resolveLinkOnExplorer(chainId)}/tx/${tx}`
}

export function resolveTokenLinkOnExplorer(token: NativeToken | ERC20Token | ERC721Token) {
    return `${resolveLinkOnExplorer(token.chainId)}/token/${token.address}`
}

export function resolveAddressLinkOnExplorer(chainId: ChainId, address: string): string {
    return `${resolveLinkOnExplorer(chainId)}/address/${address}`
}

export function resolveBlockLinkOnExplorer(chainId: ChainId, block: string): string {
    return `${resolveLinkOnExplorer(chainId)}/block/${block}`
}

export function resolveIPFSLink(ipfs: string): string {
    return `https://ipfs.fleek.co/ipfs/${ipfs}`
}

export function resolveCollectibleProviderLink(chainId: ChainId, provider: CollectibleProvider) {
    switch (provider) {
        case CollectibleProvider.OPENSEAN:
            if (chainId === ChainId.Rinkeby) return `https://testnets.opensea.io`
            return `https://opensea.io`
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleLink(
    chainId: ChainId,
    provider: CollectibleProvider,
    token: NonFungibleTokenDetailed,
) {
    switch (provider) {
        case CollectibleProvider.OPENSEAN:
            return `${resolveCollectibleProviderLink(chainId, provider)}/assets/${token.address}/${token.tokenId}`
        default:
            unreachable(provider)
    }
}

export function resolveTokenIconURL(address: string, baseURI: string) {
    const iconMap = {
        [getTokenConstants().NATIVE_TOKEN_ADDRESS]: `${baseURI}/info/logo.png`,
        '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074':
            'https://dimensiondev.github.io/Maskbook-VI/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg', // MASK
        '0x32a7C02e79c4ea1008dD6564b35F131428673c41': 'https://s2.coinmarketcap.com/static/img/coins/64x64/6747.png', // CRUST
        '0x04abEdA201850aC0124161F037Efd70c74ddC74C': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5841.png', // NEST
        '0x14de81C71B3F73874659082b971433514E201B27': 'https://etherscan.io/token/images/ykyctoken_32.png', // Yes KYC
        '0x3B73c1B2ea59835cbfcADade5462b6aB630D9890':
            'https://raw.githubusercontent.com/chainswap/chainswap-assets/main/logo_white_256.png', // TOKEN
    }
    const checksummedAddress = formatEthereumAddress(address)
    if (iconMap[checksummedAddress]) return iconMap[checksummedAddress]
    return `${baseURI}/assets/${checksummedAddress}/logo.png`
}
