import { useAccount } from '.'
import { useWeb3StateContext } from '.'

export function useWallet() {
    const account = useAccount()
    const { wallets } = useWeb3StateContext()
    return account ? wallets.find((x) => x.address.toLowerCase() === account.toLowerCase()) : undefined
}
