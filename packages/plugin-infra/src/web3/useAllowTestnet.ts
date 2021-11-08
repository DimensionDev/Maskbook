import { usePluginWeb3StateContext } from '../context'

export function useAllowTestnet() {
    return usePluginWeb3StateContext().allowTestnet
}
