import { useChainId } from './useChainId'
import { usePluginWeb3Context } from './Context'

export function useChainColor() {
    const chainId = useChainId()
    const { Utils } = usePluginWeb3Context()
    return Utils?.resolveChainColor?.(chainId) ?? 'transparent'
}
