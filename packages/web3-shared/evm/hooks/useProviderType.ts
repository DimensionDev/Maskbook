import { useWeb3StateContext } from '..'

export function useProviderType() {
    return useWeb3StateContext().providerType
}
