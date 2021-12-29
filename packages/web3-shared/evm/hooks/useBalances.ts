import { useWeb3StateContext } from '../context'

export function useBalances() {
    return useWeb3StateContext().balances
}
