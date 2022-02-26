import type { NetworkPluginID } from '../web3-types'
import { useAccount } from './useAccount'
import { useWeb3State } from './useWeb3State'
import { usePluginWeb3StateContext } from './Context'

export function useWallet(pluginID?: NetworkPluginID) {
    const account = useAccount(pluginID)
    const { Utils } = useWeb3State(pluginID)
    const { wallets } = usePluginWeb3StateContext(pluginID)

    if (!account) return
    return wallets.find((x) => Utils?.isSameAddress?.(x.address, account))
}
