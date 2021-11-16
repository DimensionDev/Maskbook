import { useWeb3StateContext } from '..'

export function useInjectedProviderType() {
    return useWeb3StateContext().injectedProviderType
}
