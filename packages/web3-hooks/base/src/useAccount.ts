import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Utils } from './useWeb3Utils.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

export function useAccount(pluginID?: NetworkPluginID, expectedAccount?: string) {
    const Utils = useWeb3Utils(pluginID)
    const { Provider } = useWeb3State(pluginID)
    const defaultAccount = useSubscriptionMaybe(Provider?.account, undefined)
    return Utils.formatAddress(expectedAccount ?? defaultAccount ?? '')
}
