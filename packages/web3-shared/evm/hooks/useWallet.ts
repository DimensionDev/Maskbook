import { useWeb3StateContext } from '../context'
import { currySameAddress } from '../utils'
import { useAccount } from './useAccount'

export function useWallet() {
    const account = useAccount()
    const { wallets } = useWeb3StateContext()
    return account ? wallets.find(currySameAddress(account)) : undefined
}
