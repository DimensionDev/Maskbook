import { useWeb3Context } from '@dimensiondev/web3-shared'

export function useChainDetailed() {
    return useWeb3Context().chainDetailed
}
