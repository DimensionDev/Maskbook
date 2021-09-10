import { useWeb3StateContext } from '../context'

export function useEtherPrice() {
    const { tokenPrices } = useWeb3StateContext()
    return tokenPrices.ethereum?.usd ?? 0
}
