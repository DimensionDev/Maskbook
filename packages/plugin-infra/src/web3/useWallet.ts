import { useAccount } from './useAccount'
import { usePluginWeb3StateContext } from './Context'

export function useWallet(pluginID?: string) {
    const account = useAccount(pluginID)
    const { wallets } = usePluginWeb3StateContext(pluginID)
    return account ? wallets.find((x) => x.address.toLowerCase() === account.toLowerCase()) : undefined
}
