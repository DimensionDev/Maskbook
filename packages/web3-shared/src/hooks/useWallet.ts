import { useWallets } from '.'
import { isSameAddress } from '../utils'
import { useWeb3Context } from './context'
import type { Wallet } from './useWallets'

export function useWallet(address?: string): Wallet | undefined {
    const address_ = useWeb3Context().selectedAddress
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address ?? address_))
}
