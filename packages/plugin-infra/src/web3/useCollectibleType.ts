import { useWeb3StateContext } from '.'

export function useCollectibleType() {
    return useWeb3StateContext().collectibleType
}
