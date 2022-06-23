import { ProviderType } from '@masknet/web3-shared-evm'
import type { BaseProvider } from './providers/Base'
import { CustomNetworkProvider } from './providers/CustomNetwork'
import { MaskWalletProvider } from './providers/MaskWallet'
import { MetaMaskProvider } from './providers/MetaMask'
import WalletConnectProvider from './providers/WalletConnect'
import { WalletLinkProvider } from './providers/WalletLink'
import { Coin98Provider } from './providers/Coin98'
import { MathWalletProvider } from './providers/MathWallet'
import FortmaticProvider from './providers/Fortmatic'
import TorusProvider from './providers/Torus'
import { NoneProvider } from './providers/None'

/**
 * Register all supported providers
 */
export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.None]: new NoneProvider(),
    [ProviderType.MaskWallet]: new MaskWalletProvider(),
    [ProviderType.MetaMask]: null!,
    [ProviderType.WalletConnect]: null!,
    [ProviderType.Coin98]: null!,
    [ProviderType.WalletLink]: null!,
    [ProviderType.MathWallet]: null!,
    [ProviderType.Fortmatic]: null!,
    [ProviderType.Torus]: null!,
    [ProviderType.CustomNetwork]: null!,
}
