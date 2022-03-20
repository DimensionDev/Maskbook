import type { NetworkPluginID } from '..'
import { useAccount } from './useAccount'
import { useWeb3State } from './useWeb3State'
import { usePluginWeb3StateContext } from './Context'

export function useWallet(pluginID?: NetworkPluginID) {
    const { wallets } = usePluginWeb3StateContext(pluginID)
    const { Utils } = useWeb3State(pluginID)
    const account = useAccount(pluginID)

    if (!account) return
    return wallets.find((x) => Utils?.isSameAddress?.(x.address, account))
}
