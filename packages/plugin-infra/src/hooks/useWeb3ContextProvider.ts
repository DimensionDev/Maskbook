import { useActivatedPlugin } from './useActivatedPlugin'

export function useWeb3ContextProvider(pluginID: string) {
    const activatedPlugin = useActivatedPlugin(pluginID)
    return activatedPlugin?.Web3ContextProvider ?? null
}
