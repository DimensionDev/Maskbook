import { upperFirst } from 'lodash-unified'
import { toHex } from 'web3-utils'
import { createLookupTableResolver } from './enum'
import CHAINS from '../assets/chains.json'
import { getRPCConstants } from '../constants'
import { ChainId, NetworkType, ProviderType } from '../types'
import COINGECKO_PLATFORMS from '../assets/coingecko-asset-platforms.json'
import COINGECKO_COIN_LIST from '../assets/coingecko-coin-list.json'

export function isChainIdValid(chainId: ChainId, allowTestnet = false) {
    const chainDetailed = getChainDetailed(chainId)
    return !!getNetworkTypeFromChainId(chainId) && (chainDetailed?.network === 'mainnet' || allowTestnet)
}

export function isChainIdMainnet(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.network === 'mainnet'
}

export function isEIP1559Supported(chainId: ChainId) {
    const features = getChainDetailed(chainId)?.features ?? []
    return features.includes('EIP1559')
}

export function isInjectedProvider(providerType: ProviderType) {
    return [ProviderType.Coin98, ProviderType.WalletLink, ProviderType.MathWallet].includes(providerType)
}

export function isFortmaticSupported(chainId: ChainId) {
    return [ChainId.Mainnet, ChainId.BSC].includes(chainId)
}

export function getChainDetailed(chainId = ChainId.Mainnet) {
    return CHAINS.find((x) => x.chainId === chainId)
}

// Learn more: https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
export function getChainDetailedCAIP(chainId = ChainId.Mainnet) {
    const chainDetailed = getChainDetailed(chainId)
    const { RPC = [] } = getRPCConstants(chainId)
    if (!chainDetailed) return
    return {
        chainId: toHex(chainDetailed.chainId),
        chainName: chainDetailed.name,
        nativeCurrency: chainDetailed.nativeCurrency,
        rpcUrls: RPC,
        blockExplorerUrls: [
            chainDetailed.explorers && chainDetailed.explorers.length > 0 && chainDetailed.explorers[0].url
                ? chainDetailed.explorers[0].url
                : chainDetailed.infoURL,
        ],
    }
}

export function getChainRPC(chainId: ChainId, seed: number) {
    const { RPC, RPC_WEIGHTS } = getRPCConstants(chainId)
    if (!RPC || !RPC_WEIGHTS) throw new Error(`Unknown chain id: ${chainId}.`)
    return RPC[RPC_WEIGHTS[seed]]
}

export function getChainName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.name ?? 'Unknown Network'
}

export function getChainShortName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.shortName ?? 'Unknown Network'
}

export function getChainFullName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.fullName ?? 'Unknown Network'
}

export function getChainIdFromName(name: string) {
    if (!name) return
    const chainDetailed = CHAINS.find((x) =>
        [x.chain, x.network, x.name, x.shortName, x.fullName ?? '']
            .filter(Boolean)
            .map((y) => y.toLowerCase())
            .includes(name.toLowerCase()),
    )
    return chainDetailed && getNetworkTypeFromChainId(chainDetailed.chainId)
        ? (chainDetailed.chainId as ChainId)
        : undefined
}

export const getChainIdFromNetworkType = createLookupTableResolver<NetworkType, ChainId>(
    {
        [NetworkType.Ethereum]: ChainId.Mainnet,
        [NetworkType.Binance]: ChainId.BSC,
        [NetworkType.Polygon]: ChainId.Matic,
        [NetworkType.Arbitrum]: ChainId.Arbitrum,
        [NetworkType.xDai]: ChainId.xDai,
        [NetworkType.Fantom]: ChainId.Fantom,
    },
    ChainId.Mainnet,
)

export function getNetworkTypeFromChainId(chainId: ChainId, value?: boolean) {
    const map: Record<NetworkType, string> = {
        [NetworkType.Ethereum]: 'ETH',
        [NetworkType.Binance]: 'BSC',
        [NetworkType.Polygon]: 'Polygon',
        [NetworkType.Arbitrum]: 'Arbitrum',
        [NetworkType.xDai]: 'xDai',
        [NetworkType.Fantom]: 'FTM',
    }
    const chainDetailed = getChainDetailed(chainId)
    const entry = Object.entries(map).find(([key, value]) => {
        if (value === chainDetailed?.chain) return true
        return false
    })
    if (value) return entry?.[1] as NetworkType | undefined
    return entry?.[0] as NetworkType | undefined
}
export function getChainFromChainId(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.chain
}

export function getCoingeckoPlatformId(chainId: ChainId) {
    return COINGECKO_PLATFORMS.find((platform) => platform.chainId === chainId)?.id
}

export function getCoingeckoCoinId(chainId: ChainId) {
    const coin = COINGECKO_COIN_LIST.find((coin) => coin.chainId === chainId)
    if (!coin) {
        console.log(new Error(`No coin config found for ${chainId}`))
        return
    }
    return coin.id
}

export function getNetworkName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return 'Unknown Network'
    if (chainDetailed.networkId === ChainId.Matic) return chainDetailed.fullName
    if (chainDetailed.network === 'mainnet') return chainDetailed.chain
    return upperFirst(chainDetailed.network)
}
