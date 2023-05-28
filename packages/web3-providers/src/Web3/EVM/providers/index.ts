import { type ChainId, ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { NoneProvider } from './None.js'
import { MetaMaskProvider } from './MetaMask.js'
import WalletConnectProvider from './WalletConnect.js'
import { EVM_Coin98Provider } from './Coin98.js'
import { WalletLinkProvider } from './WalletLink.js'
import { MathWalletProvider } from './MathWallet.js'
import { CloverProvider } from './Clover.js'
import FortmaticProvider from './Fortmatic.js'
import { OperaProvider } from './Opera.js'
import { MaskWalletProvider } from './MaskWallet.js'
import { CustomNetworkProvider } from './CustomNetwork.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface EVM_Provider extends WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {}

export const Providers: Record<ProviderType, EVM_Provider> = {
    [ProviderType.None]: new NoneProvider(),
    [ProviderType.MaskWallet]: new MaskWalletProvider(),
    [ProviderType.MetaMask]: new MetaMaskProvider(),
    [ProviderType.WalletConnect]: new WalletConnectProvider(),
    [ProviderType.Coin98]: new EVM_Coin98Provider(),
    [ProviderType.WalletLink]: new WalletLinkProvider(),
    [ProviderType.MathWallet]: new MathWalletProvider(),
    [ProviderType.Clover]: new CloverProvider(),
    [ProviderType.Fortmatic]: new FortmaticProvider(),
    [ProviderType.Opera]: new OperaProvider(),
    [ProviderType.CustomNetwork]: new CustomNetworkProvider(),
}
