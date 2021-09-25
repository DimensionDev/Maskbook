import { useWeb3StateContext } from '../context'

export function useChainDetailed() {
    return useWeb3StateContext().chainDetailed
}
