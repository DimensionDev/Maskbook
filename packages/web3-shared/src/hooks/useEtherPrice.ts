import { useWeb3StateContext } from '../context'

export function useEtherPrice() {
    return useWeb3StateContext().etherPrice
}
