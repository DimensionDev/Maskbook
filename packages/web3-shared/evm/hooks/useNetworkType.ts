import { useWeb3StateContext } from '../context'

export function useNetworkType() {
    return useWeb3StateContext().networkType
}
