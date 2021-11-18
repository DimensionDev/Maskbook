import { useChainId, useWeb3State } from '.'

export function useChainDetailed() {
    const chainId = useChainId()
    const { Utils } = useWeb3State()
    return Utils?.getChainDetailed?.(chainId) ?? null
}
