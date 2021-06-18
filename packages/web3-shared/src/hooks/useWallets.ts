import { MatchAddress } from '../utils'
import { useWeb3StateContext } from '../context'
import { ProviderType, Wallet } from '../types'

export function useWallets(type?: ProviderType): Wallet[] {
    const { providerType, wallets } = useWeb3StateContext()
    if (type === ProviderType.Maskbook) return wallets.filter((x) => x.hasPrivateKey)
    const matchAddress = MatchAddress(providerType)
    if (type === providerType) return wallets.filter(({ address }) => matchAddress(address))
    if (type) return []
    return wallets
}
