import { useWeb3StateContext } from '.'

export function useNetworkType() {
    return useWeb3StateContext().networkType
}
