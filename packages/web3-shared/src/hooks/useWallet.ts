import type { Wallet } from '../types'
import { MatchAddress } from '../utils'
import { useWeb3StateContext } from '../context'

export function useWallet(address?: string): Wallet | undefined {
    const { account: address_, wallets } = useWeb3StateContext()
    const matchAddress = MatchAddress(address ?? address_)
    return wallets.find((x) => matchAddress(x.address))
}
