import { useWeb3Context } from './context'
import { useSubscription } from 'use-subscription'
import { useWallets } from '.'
import { isSameAddress } from '../utils'

export function useWallet(address?: string) {
    const address_ = useSubscription(useWeb3Context().selectedWalletAddress)
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address ?? address_))
}
