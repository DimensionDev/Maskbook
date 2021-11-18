import { useChainId, useWeb3State } from '.'

export function useChainColor() {
    const chainId = useChainId()
    const { Utils } = useWeb3State()
    return Utils?.resolveChainColor?.(chainId) ?? 'transparent'
}
