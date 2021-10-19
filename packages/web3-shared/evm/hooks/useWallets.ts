import { useAccount } from '.'
import { useWeb3StateContext } from '../context'
import { ProviderType } from '../types'
import { currySameAddress } from '../utils'

export function useWallets(type?: ProviderType) {
    const account = useAccount()
    const { providerType, wallets } = useWeb3StateContext()
    if (type === ProviderType.MaskWallet) return wallets.filter((x) => x.hasStoredKeyInfo)
    if (type === providerType) return wallets.filter(currySameAddress(account))
    if (type) return []
    return wallets
}
