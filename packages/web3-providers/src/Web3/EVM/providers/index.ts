import { Flags } from '@masknet/flags'
import { type ChainId, ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { EVMNoneProvider } from './None.js'
import { BrowserProvider } from './Browser.js'
import { MetaMaskProvider } from './MetaMask.js'
import { WalletConnectProvider } from './WalletConnect.js'
import { EVM_Coin98Provider } from './Coin98.js'
import { CoinbaseProvider } from './Coinbase.js'
import { OKXProvider } from './OKX.js'
import { CloverProvider } from './Clover.js'
import { FortmaticProvider } from './Fortmatic.js'
import { OperaProvider } from './Opera.js'
import { MaskWalletProvider } from './MaskWallet.js'
import { EVMCustomNetworkProvider } from './CustomNetwork.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface EVMWalletProvider extends WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {}

export const EVMWalletProviders = {
    [ProviderType.None]: new EVMNoneProvider(),
    [ProviderType.MaskWallet]: new MaskWalletProvider(),
    [ProviderType.Browser]: new BrowserProvider(),
    [ProviderType.MetaMask]: new MetaMaskProvider(),
    [ProviderType.WalletConnect]: Flags.wc_enabled ? new WalletConnectProvider() : new EVMNoneProvider(),
    [ProviderType.Coin98]: new EVM_Coin98Provider(),
    [ProviderType.Coinbase]: new CoinbaseProvider(),
    [ProviderType.OKX]: new OKXProvider(),
    [ProviderType.Clover]: new CloverProvider(),
    [ProviderType.Fortmatic]: new FortmaticProvider(),
    [ProviderType.Opera]: new OperaProvider(),
    [ProviderType.CustomNetwork]: new EVMCustomNetworkProvider(),
} satisfies Record<ProviderType, EVMWalletProvider>
