import { usePluginWeb3StateContext } from '../context'

export function useChainDetailed() {
    return usePluginWeb3StateContext().chainDetailed
}
