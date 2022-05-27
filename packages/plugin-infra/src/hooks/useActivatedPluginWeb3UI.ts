import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../entry-web3'
import { useActivatedPlugin } from './useActivatedPlugin'

export function useActivatedPluginWeb3UI<T extends NetworkPluginID>(pluginID: T) {
    const activatedPlugin = useActivatedPlugin(pluginID, 'any')
    return (activatedPlugin?.Web3UI ?? {}) as Web3Helper.Web3UI<T>
}
