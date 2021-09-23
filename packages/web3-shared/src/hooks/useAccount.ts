import { unreachable } from '@dimensiondev/kit'
import { first } from 'lodash-es'
import { ProviderType } from '..'
import { useWeb3StateContext } from '../context'

/**
 * Get the address of the default wallet
 */
export function useAccount(type?: ProviderType) {
    const { account, accountMaskWallet, wallets } = useWeb3StateContext()

    if (process.env.architecture === 'app') return first(wallets)?.address ?? ''
    if (location.pathname === '/popups.html') return accountMaskWallet
    if (!type) return account

    switch (type) {
        case ProviderType.MaskWallet:
            return accountMaskWallet
        case ProviderType.MetaMask:
        case ProviderType.WalletConnect:
        case ProviderType.CustomNetwork:
            // TODO: support external providers
            return ''
        default:
            unreachable(type)
    }
}
