import { useWeb3StateContext } from '../context'

export function useEIP1559Supported() {
    const features = useWeb3StateContext().chainDetailed?.features ?? []
    return features.includes('EIP1559')
}
