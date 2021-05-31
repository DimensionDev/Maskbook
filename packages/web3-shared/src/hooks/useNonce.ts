import { useWeb3StateContext } from '../context'

export function useNonce() {
    return useWeb3StateContext().nonce
}
