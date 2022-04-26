import type { Web3Helper } from '../web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useActivatedPlugin } from './useActivatedPlugin'

export function useActivatedPluginWeb3State<T extends NetworkPluginID>(pluginID: T) {
    const activatedPlugin = useActivatedPlugin(pluginID, 'any')
    return (activatedPlugin?.Web3State ?? {}) as Web3Helper.Web3State<T>
}
