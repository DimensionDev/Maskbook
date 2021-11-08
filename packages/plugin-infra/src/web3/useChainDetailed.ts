import { useWeb3StateContext } from '.'

export function useChainDetailed() {
    return useWeb3StateContext().chainDetailed
}
