import { useWeb3Context } from '../context'

export function useGasPrice() {
    return useWeb3Context().gasPrice
}
