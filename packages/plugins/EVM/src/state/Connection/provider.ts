import { ProviderType } from '@masknet/web3-shared-evm'
import type { BaseProvider } from './providers/Base.js'
import { CustomNetworkProvider } from './providers/CustomNetwork.js'
import { MaskWalletProvider } from './providers/MaskWallet.js'
import { MetaMaskProvider } from './providers/MetaMask.js'
import WalletConnectProvider from './providers/WalletConnect.js'
import { WalletLinkProvider } from './providers/WalletLink.js'
import { Coin98Provider } from './providers/Coin98.js'
import { MathWalletProvider } from './providers/MathWallet.js'
import FortmaticProvider from './providers/Fortmatic.js'
import TorusProvider from './providers/Torus.js'
import { NoneProvider } from './providers/None.js'
import { SmartPayProvider } from './providers/SmartPay.js'

/**
 * Register all supported providers
 */
export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.None]: new NoneProvider(),
    [ProviderType.MaskWallet]: new MaskWalletProvider(),
    [ProviderType.MetaMask]: new MetaMaskProvider(),
    [ProviderType.WalletConnect]: new WalletConnectProvider(),
    [ProviderType.Coin98]: new Coin98Provider(),
    [ProviderType.WalletLink]: new WalletLinkProvider(),
    [ProviderType.MathWallet]: new MathWalletProvider(),
    [ProviderType.Fortmatic]: new FortmaticProvider(),
    [ProviderType.Torus]: new TorusProvider(),
    [ProviderType.SmartPay]: new SmartPayProvider(),
    [ProviderType.CustomNetwork]: new CustomNetworkProvider(),
}
