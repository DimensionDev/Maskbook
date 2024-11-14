import { Flags } from '@masknet/flags'
import { type ChainId, ProviderType, type Web3Provider } from '@masknet/web3-shared-evm'
import { EVMNoneProvider } from './None.js'
import { BrowserProvider } from './Browser.js'
import { MetaMaskProvider } from './MetaMask.js'
import { WalletConnectProvider } from './WalletConnect.js'
import { EVM_Coin98Provider } from './Coin98.js'
import { CoinbaseProvider } from './Coinbase.js'
import { OKXProvider } from './OKX.js'
import { BitGetProvider } from './BitGet.js'
import { RainbowProvider } from './Rainbow.js'
import { OneKeyProvider } from './OneKey.js'
import { RabbyProvider } from './Rabby.js'
import { CloverProvider } from './Clover.js'
import { OperaProvider } from './Opera.js'
import { ZerionProvider } from './Zerion.js'
import { MaskWalletProvider, setMaskWalletProviderInstance } from './MaskWallet.js'
import { EVMCustomEventProvider } from './CustomEvent.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { BaseHostedStorage } from './BaseHosted.js'
import type { EIP4337ProviderStorage } from './BaseContractWallet.js'
import { TrustProvider } from './Trust.js'
import { TokenPocketProvider } from './TokenPocket.js'
import { CryptoProvider } from './Crypto.js'

export interface EVMWalletProvider extends WalletAPI.Provider<ChainId, ProviderType> {
    /** Create an instance that implement the wallet protocol. */
    createWeb3Provider(options?: WalletAPI.ProviderOptions<ChainId>): Web3Provider
}

export { MaskWalletProviderInstance } from './MaskWallet.js'
export let EVMWalletProviders: ReturnType<typeof createEVMWalletProviders>
export function createEVMWalletProviders(
    context: WalletAPI.IOContext,
    hostStorage: BaseHostedStorage,
    eip4337Storage: EIP4337ProviderStorage,
) {
    const p = {
        [ProviderType.None]: new EVMNoneProvider(),
        [ProviderType.MaskWallet]: new MaskWalletProvider(context.MaskWalletContext, hostStorage, eip4337Storage),
        [ProviderType.Browser]: new BrowserProvider(),
        [ProviderType.MetaMask]: new MetaMaskProvider(),
        [ProviderType.WalletConnect]:
            Flags.wc_enabled ? new WalletConnectProvider(context.WalletConnectContext) : new EVMNoneProvider(),
        [ProviderType.Coin98]: new EVM_Coin98Provider(),
        [ProviderType.Coinbase]: new CoinbaseProvider(),
        [ProviderType.Crypto]: new CryptoProvider(),
        [ProviderType.BitGet]: new BitGetProvider(),
        [ProviderType.OKX]: new OKXProvider(),
        [ProviderType.OneKey]: new OneKeyProvider(),
        [ProviderType.Rabby]: new RabbyProvider(),
        [ProviderType.Rainbow]: new RainbowProvider(),
        [ProviderType.Trust]: new TrustProvider(),
        [ProviderType.TokenPocket]: new TokenPocketProvider(),
        [ProviderType.Clover]: new CloverProvider(),
        [ProviderType.Opera]: new OperaProvider(),
        [ProviderType.Zerion]: new ZerionProvider(),
        [ProviderType.CustomEvent]: new EVMCustomEventProvider(),
    } satisfies Record<ProviderType, EVMWalletProvider>
    EVMWalletProviders = p
    setMaskWalletProviderInstance(p[ProviderType.MaskWallet])
    return p
}
