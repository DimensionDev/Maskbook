import { useChainId } from './'
import { resolveChainColor } from '../pipes'

export function useChainColor() {
    const chainId = useChainId()
    return resolveChainColor(chainId)
}
