import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useActivatedPlugin } from './useActivatedPlugin.js'

export function useActivatedPluginWeb3State<T extends NetworkPluginID>(pluginID: T) {
    const activatedPlugin = useActivatedPlugin(pluginID, 'any')
    console.log(activatedPlugin)
    return (activatedPlugin?.Web3State ?? {}) as Web3Helper.Web3State<T>
}
