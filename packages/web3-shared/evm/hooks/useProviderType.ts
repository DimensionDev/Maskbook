import { useWeb3StateContext } from '../context'

export function useProviderType() {
    return useWeb3StateContext().providerType
}
