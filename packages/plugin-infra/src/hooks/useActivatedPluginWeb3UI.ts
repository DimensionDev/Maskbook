import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useActivatedPlugin } from './useActivatedPlugin.js'

export function useActivatedPluginWeb3UI<T extends NetworkPluginID>(pluginID: T) {
    const activatedPlugin = useActivatedPlugin(pluginID, 'any')
    return (activatedPlugin?.Web3UI ?? {}) as Web3Helper.Web3UI<T>
}
