import { usePluginWeb3StateContext } from '../context'

export function useProviderType() {
    return usePluginWeb3StateContext().providerType
}
