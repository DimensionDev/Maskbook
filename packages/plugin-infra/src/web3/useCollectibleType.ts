import { usePluginWeb3StateContext } from '../context'

export function useCollectibleType() {
    return usePluginWeb3StateContext().collectibleType
}
