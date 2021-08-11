import { useWeb3StateContext } from "../context";

export function useChainSupports1159() {
    const features: string[] = useWeb3StateContext().chainDetailed?.features ?? []
    return features.includes('EIP1159')
}
