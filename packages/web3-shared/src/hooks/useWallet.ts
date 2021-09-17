import type { Wallet } from '../types'
import type { ProviderType } from '../types'
import { useWeb3StateContext } from '../context'
import { currySameAddress } from '../utils'
import { useAccount } from '.'

export function useWallet(type?: ProviderType): Wallet | undefined {
    const account = useAccount(type)
    const { wallets } = useWeb3StateContext()
    return account ? wallets.find(currySameAddress(account)) : undefined
}
