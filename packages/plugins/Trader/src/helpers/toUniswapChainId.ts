import type { ChainId } from '@masknet/web3-shared-evm'

export function toUniswapChainId(chainId: ChainId) {
    return chainId as number
}
