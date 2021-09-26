import { useWeb3StateContext } from '../context'
import { ProviderType, Wallet } from '../types'
import { currySameAddress } from '../utils'

export function useWallets(type?: ProviderType): Wallet[] {
    const { providerType, wallets } = useWeb3StateContext()
    if (type === ProviderType.MaskWallet) return wallets.filter((x) => x.hasPrivateKey)
    if (type === providerType) return wallets.filter(currySameAddress(providerType))
    if (type) return []
    return wallets
}
