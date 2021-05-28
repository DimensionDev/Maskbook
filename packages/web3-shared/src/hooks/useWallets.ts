import { useSubscription } from 'use-subscription'
import { isSameAddress } from '../utils'
import { useWeb3Provider, useWeb3Context } from '../context'
import { ProviderType, Wallet } from '../types'

export function useWallets(type?: ProviderType): Wallet[] {
    const wallets = useWeb3Context().wallets
    const providerType = useSubscription(useWeb3Provider().providerType)
    if (type === ProviderType.Maskbook) return wallets.filter((x) => x.hasPrivateKey)
    if (type === providerType) return wallets.filter((x) => isSameAddress(x.address, providerType))
    if (type) return []
    return wallets
}
