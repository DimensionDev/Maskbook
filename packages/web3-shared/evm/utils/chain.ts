import { ChainId } from '../types'
import CHAINS from '../constants/chains.json'

export function getChainDetailed(chainId = ChainId.Mainnet) {
    return CHAINS.find((x) => x.chainId === chainId)
}

export function isFortmaticSupported(chainId: ChainId) {
    return [ChainId.Mainnet, ChainId.BSC].includes(chainId)
}
