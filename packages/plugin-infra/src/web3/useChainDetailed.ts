import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useChainDetailed() {
    const chainId = useChainId()
    const { Utils } = useWeb3State()
    return Utils?.getChainDetailed?.(chainId) ?? null
}
