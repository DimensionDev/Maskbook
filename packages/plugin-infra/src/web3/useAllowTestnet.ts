import { useWeb3StateContext } from '.'

export function useAllowTestnet() {
    return useWeb3StateContext().allowTestnet
}
