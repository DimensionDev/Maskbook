import { useActivatedPlugin } from '.'

export function useActivatedPluginWeb3UI(pluginID: string) {
    const activatedPlugin = useActivatedPlugin(pluginID)
    return activatedPlugin?.Web3UI ?? null
}
