import { useWeb3StateContext } from '../context'

export function useEIP1159Supported() {
    const features = useWeb3StateContext().chainDetailed?.features ?? []
    return features.includes('EIP1159')
}
