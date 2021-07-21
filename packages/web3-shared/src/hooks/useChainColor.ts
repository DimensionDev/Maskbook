import { useChainId } from './index'
import { resolveChainColor } from '../pipes'

export function useChainColor() {
    const chainId = useChainId()
    return resolveChainColor(chainId)
}
