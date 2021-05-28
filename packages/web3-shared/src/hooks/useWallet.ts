import { useWallets } from '.'
import type { Wallet } from '../types'
import { isSameAddress } from '../utils'
import { useWeb3Context } from '../context'

export function useWallet(address?: string): Wallet | undefined {
    const address_ = useWeb3Context().account
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address ?? address_))
}
