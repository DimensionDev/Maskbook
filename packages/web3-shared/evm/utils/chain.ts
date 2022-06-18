import { ChainId } from '../types'

export function isFortmaticSupported(chainId: ChainId) {
    return [ChainId.Mainnet, ChainId.BSC].includes(chainId)
}
