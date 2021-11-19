import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useChainColor() {
    const chainId = useChainId()
    const { Utils } = useWeb3State()
    return Utils?.resolveChainColor?.(chainId) ?? 'transparent'
}
