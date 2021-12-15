import { useActivatedPlugin } from './useActivatedPlugin'

export function useActivatedPluginWeb3UI(pluginID: string) {
    const activatedPlugin = useActivatedPlugin(pluginID, 'any')
    return activatedPlugin?.Web3UI ?? null
}
