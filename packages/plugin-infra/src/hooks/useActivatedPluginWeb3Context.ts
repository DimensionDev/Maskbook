import { useActivatedPlugin } from '.'

export function useActivatedPluginWeb3Context(pluginID: string) {
    const activatedPlugin = useActivatedPlugin(pluginID)
    return activatedPlugin?.Web3Context ?? null
}
