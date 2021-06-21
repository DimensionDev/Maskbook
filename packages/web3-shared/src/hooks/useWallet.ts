import type { Wallet } from '../types'
import { useWeb3StateContext } from '../context'
import { SameAddress } from '../utils'

export function useWallet(address?: string): Wallet | undefined {
    const { account: address_, wallets } = useWeb3StateContext()
    return wallets.find(SameAddress(address ?? address_))
}
