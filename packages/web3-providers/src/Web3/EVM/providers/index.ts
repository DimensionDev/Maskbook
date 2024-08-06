import { type ChainId, ProviderType, type Web3Provider } from '@masknet/web3-shared-evm'
import { EVMNoneProvider } from './None.js'
import { BrowserProvider } from './Browser.js'
import { MetaMaskProvider } from './MetaMask.js'
import { EVMCustomEventProvider } from './CustomEvent.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { BaseHostedStorage } from './BaseHosted.js'
import type { EIP4337ProviderStorage } from './BaseContractWallet.js'

export interface EVMWalletProvider extends WalletAPI.Provider<ChainId, ProviderType> {
    /** Create an instance that implement the wallet protocol. */
    createWeb3Provider(options?: WalletAPI.ProviderOptions<ChainId>): Web3Provider
}

export let EVMWalletProviders: ReturnType<typeof createEVMWalletProviders>
export function createEVMWalletProviders(
    context: WalletAPI.IOContext,
    hostStorage: BaseHostedStorage,
    eip4337Storage: EIP4337ProviderStorage,
) {
    const p = {
        [ProviderType.None]: new EVMNoneProvider(),
        [ProviderType.Browser]: new BrowserProvider(),
        [ProviderType.MetaMask]: new MetaMaskProvider(),
        [ProviderType.MaskWallet]: new MetaMaskProvider(),
        [ProviderType.CustomEvent]: new EVMCustomEventProvider(),
    } satisfies Record<ProviderType, EVMWalletProvider>
    EVMWalletProviders = p
    return p
}
