import CHAINS from '../assets/chains.json'
import { useChainId } from './useChainId'

export function useChainDetailed() {
    const chainId = useChainId()
    return CHAINS.find((x) => x.chainId === chainId)
}
