import { useActivatedPlugin } from './useActivatedPlugin'

export function useWeb3UIProvider(pluginID: string) {
    const activatedPlugin = useActivatedPlugin(pluginID)
    return activatedPlugin?.Web3UIProvider ?? null
}
