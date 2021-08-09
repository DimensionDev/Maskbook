import { useWeb3StateContext } from '../context'

export function useChainIdValid() {
    return useWeb3StateContext().chainIdValid
}
