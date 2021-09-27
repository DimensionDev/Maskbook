import type { Wallet } from '../types'
import { useWeb3StateContext } from '../context'
import { currySameAddress } from '../utils'
import { useAccount } from '.'

export function useWallet(): Wallet | undefined {
    const account = useAccount()
    const { wallets } = useWeb3StateContext()
    return account ? wallets.find(currySameAddress(account)) : undefined
}
