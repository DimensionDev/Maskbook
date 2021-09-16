import { createLookupTableResolver } from './enum'
import CHAINS from '../assets/chains.json'
import { getRPCConstants } from '../constants'
import { ChainId, NetworkType } from '../types'
import COINGECKO_PLATFORMS from '../assets/coingecko-asset-platforms.json'
import COINGECKO_COIN_LIST from '../assets/coingecko-coin-list.json'
import { upperFirst } from 'lodash-es'

export function isChainIdValid(chainId: ChainId, allowTestnet = false) {
    const chainDetailed = getChainDetailed(chainId)
    return !!getNetworkTypeFromChainId(chainId) && (chainDetailed?.network === 'mainnet' || allowTestnet)
}

export function isChainIdMainnet(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.network === 'mainnet'
}

export function isEIP1159Supported(chainId: ChainId) {
    const features = getChainDetailed(chainId)?.features ?? []
    return features.includes('EIP1159')
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
        chainId: `0x${chainDetailed.chainId.toString(16)}`,
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
    },
    ChainId.Mainnet,
)

export function getNetworkTypeFromChainId(chainId: ChainId) {
    const map: Record<NetworkType, string> = {
        [NetworkType.Ethereum]: 'ETH',
        [NetworkType.Binance]: 'BSC',
        [NetworkType.Polygon]: 'Matic',
        [NetworkType.Arbitrum]: 'Arbitrum',
        [NetworkType.xDai]: 'xDai',
    }
    const chainDetailed = getChainDetailed(chainId)
    const entry = Object.entries(map).find(([key, value]) => {
        if (value === chainDetailed?.chain) return true
        return false
    })
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
    return COINGECKO_COIN_LIST.find((coin) => coin.chainId === chainId)?.id
}

export function getNetworkName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return 'Unknown Network'
    if (chainDetailed.networkId === ChainId.Matic) return chainDetailed.fullName
    if (chainDetailed.network === 'mainnet') return chainDetailed.chain
    return upperFirst(chainDetailed.network)
}
