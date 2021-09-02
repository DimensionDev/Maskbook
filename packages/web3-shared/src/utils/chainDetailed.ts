import { safeUnreachable } from '@dimensiondev/kit'
import CHAINS from '../assets/chains.json'
import { getRPCConstants } from '../constants'
import { ChainId, NetworkType } from '../types'
import COINGECKO_PLATFORMS from '../assets/coingecko-asset-platforms.json'

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

export function getChainIdFromNetworkType(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return ChainId.Mainnet
        case NetworkType.Binance:
            return ChainId.BSC
        case NetworkType.Polygon:
            return ChainId.Matic
        case NetworkType.Arbitrum:
            return ChainId.Arbitrum
        case NetworkType.xDai:
            return ChainId.xDai
        default:
            safeUnreachable(networkType)
            return ChainId.Mainnet
    }
}

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

export function getCoingeckoPlatformId(chain: ChainId) {
    return COINGECKO_PLATFORMS.find((platform) => platform.chain_identifier === chain)?.id
}
