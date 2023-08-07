import { NETWORK_DESCRIPTORS } from '../constants/index.js'
import type { ChainId } from '../types/index.js'

export function getAverageBlockDelay(chainId: ChainId, scale = 1) {
    const delay = NETWORK_DESCRIPTORS.find((x) => x.chainId === chainId)?.averageBlockDelay ?? 10
    return delay * scale * 1000
}
