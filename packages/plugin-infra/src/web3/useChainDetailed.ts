import { useChainId } from './useChainId'
import { usePluginWeb3Context } from './Context'

export function useChainDetailed() {
    const chainId = useChainId()
    const { Utils } = usePluginWeb3Context()
    return Utils?.getChainDetailed?.(chainId) ?? null
}
