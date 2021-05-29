import type { Wallet } from '../types'
import { isSameAddress } from '../utils'
import { useWeb3StateContext } from '../context'

export function useWallet(address?: string): Wallet | undefined {
    const { account: address_, wallets } = useWeb3StateContext()
    return wallets.find((x) => isSameAddress(x.address, address ?? address_))
}
