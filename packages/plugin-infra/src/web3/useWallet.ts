import { useAccount } from '.'
import { usePluginWeb3StateContext } from '../context'

export function useWallet() {
    const account = useAccount()
    const { wallets } = usePluginWeb3StateContext()
    return account ? wallets.find((x) => x.address.toLowerCase() === account.toLowerCase()) : undefined
}
