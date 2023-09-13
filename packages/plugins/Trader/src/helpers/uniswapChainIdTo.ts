import type { ChainId } from '@masknet/web3-shared-evm'

export function uniswapChainIdTo(chainId: number) {
    return chainId as ChainId
}
