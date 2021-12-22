import type { NetworkPluginID } from '..'
import { useAccount } from './useAccount'
import { usePluginWeb3StateContext } from './Context'
import { isSameAddress } from '@masknet/web3-shared-evm'

export function useWallet(pluginID?: NetworkPluginID) {
    const account = useAccount(pluginID)
    const { wallets } = usePluginWeb3StateContext(pluginID)
    return wallets?.find((x) => isSameAddress(x.address, account))
}
