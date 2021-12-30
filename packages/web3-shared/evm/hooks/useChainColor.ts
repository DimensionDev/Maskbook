import { useChainId } from './useChainId'
import { resolveChainColor } from '../pipes'

export function useChainColor() {
    const chainId = useChainId()
    return resolveChainColor(chainId)
}
