import { usePluginWeb3StateContext } from '../context'

export function useNetworkType() {
    return usePluginWeb3StateContext().networkType
}
