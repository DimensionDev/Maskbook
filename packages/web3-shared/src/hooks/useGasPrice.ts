import { useWeb3StateContext } from '../context'

export function useGasPrice() {
    return useWeb3StateContext().gasPrice
}
