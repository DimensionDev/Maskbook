import { useWeb3StateContext } from '../context'

export function useAllowTestnet() {
    return useWeb3StateContext().allowTestnet
}
