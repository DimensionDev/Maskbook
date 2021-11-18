import { useActivatedPlugin } from '.'

export function useActivatedPluginWeb3State(pluginID: string) {
    const activatedPlugin = useActivatedPlugin(pluginID)
    return activatedPlugin?.Web3State ?? null
}
