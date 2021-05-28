import { useWeb3Context } from '../context'

export function useChainDetailed() {
    return useWeb3Context().chainDetailed
}
