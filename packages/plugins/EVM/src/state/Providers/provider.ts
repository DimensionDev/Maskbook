import { ProviderType } from '@masknet/web3-shared-evm'
import type { BaseProvider } from './Base.js'
import { CustomNetworkProvider } from './CustomNetwork.js'
import { MaskWalletProvider } from './MaskWallet.js'
import { MetaMaskProvider } from './MetaMask.js'
import WalletConnectProvider from './WalletConnect.js'
import { WalletLinkProvider } from './WalletLink.js'
import { Coin98Provider } from './Coin98.js'
import { MathWalletProvider } from './MathWallet.js'
import { CloverProvider } from './Clover.js'
import FortmaticProvider from './Fortmatic.js'
import { OperaProvider } from './Opera.js'
import { NoneProvider } from './None.js'

/**
 * Register all supported providers
 */
export const RegisteredProviders: Record<ProviderType, BaseProvider> = {
    [ProviderType.None]: new NoneProvider(),
    [ProviderType.MaskWallet]: new MaskWalletProvider(),
    [ProviderType.MetaMask]: new MetaMaskProvider(),
    [ProviderType.WalletConnect]: new WalletConnectProvider(),
    [ProviderType.Coin98]: new Coin98Provider(),
    [ProviderType.WalletLink]: new WalletLinkProvider(),
    [ProviderType.MathWallet]: new MathWalletProvider(),
    [ProviderType.Clover]: new CloverProvider(),
    [ProviderType.Fortmatic]: new FortmaticProvider(),
    [ProviderType.Opera]: new OperaProvider(),
    [ProviderType.CustomNetwork]: new CustomNetworkProvider(),
}
