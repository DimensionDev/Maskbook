import { useActivatedPlugin } from './useActivatedPlugin'

export function useActivatedPluginWeb3State(pluginID: string) {
    const activatedPlugin = useActivatedPlugin(pluginID, 'any')
    return activatedPlugin?.Web3State ?? null
}
