import { safeUnreachable } from '@dimensiondev/maskbook-shared'
import CHAINS from '../assets/chains.json'
import { ChainId, NetworkType } from '../types'

export function getChainDetailed(chainId: ChainId = ChainId.Mainnet) {
    return CHAINS.find((x) => x.chainId === chainId)
}

// Learn more: https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
export function getChainDetailedCAIP(chainId: ChainId = ChainId.Mainnet) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return
    return {
        chainId: `0x${chainDetailed.chainId.toString(16)}`,
        chainName: chainDetailed.name,
        nativeCurrency: chainDetailed.nativeCurrency,
        rpcUrls: chainDetailed.rpc,
        blockExplorerUrls: [
            chainDetailed.explorers && chainDetailed.explorers.length > 0 && chainDetailed.explorers[0].url
                ? chainDetailed.explorers[0].url
                : chainDetailed.infoURL,
        ],
    }
}

export function getChainName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.name ?? 'Unknown'
}

export function getChainFullName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.fullName ?? 'Unknown'
}

export function getChainIdFromName(name: string) {
    const chainDetailed = CHAINS.find((x) =>
        [x.chain, x.network, x.name, x.shortName, x.fullName].map((y) => y.toLowerCase()).includes(name.toLowerCase()),
    )
    return chainDetailed?.chainId as ChainId | undefined
}

export function getChainIdFromNetworkType(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return ChainId.Mainnet
        case NetworkType.Binance:
            return ChainId.BSC
        case NetworkType.Polygon:
            return ChainId.Matic
        default:
            safeUnreachable(networkType)
            return ChainId.Mainnet
    }
}

export function getNetworkTypeFromChainId(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    switch (chainDetailed?.chain) {
        case 'ETH':
            return NetworkType.Ethereum
        case 'BSC':
            return NetworkType.Binance
        case 'Matic':
            return NetworkType.Polygon
        default:
            throw new Error('Unknown chain id.')
    }
}
