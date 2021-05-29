import { isSameAddress } from '../utils'
import { useWeb3StateContext } from '../context'
import { ProviderType, Wallet } from '../types'

export function useWallets(type?: ProviderType): Wallet[] {
    const { providerType, wallets } = useWeb3StateContext()
    if (type === ProviderType.Maskbook) return wallets.filter((x) => x.hasPrivateKey)
    if (type === providerType) return wallets.filter((x) => isSameAddress(x.address, providerType))
    if (type) return []
    return wallets
}
