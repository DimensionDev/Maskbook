import { useWeb3Context } from '../context'

export function useNonce() {
    return useWeb3Context().nonce
}
