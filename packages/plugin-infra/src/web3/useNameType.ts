import { usePluginWeb3StateContext } from '../context'

export function useNameType() {
    return usePluginWeb3StateContext().nameType
}
