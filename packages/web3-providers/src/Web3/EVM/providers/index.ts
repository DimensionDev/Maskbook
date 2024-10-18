import { type ChainId, ProviderType, type Web3Provider } from '@masknet/web3-shared-evm'
import { EVMNoneProvider } from './None.js'
import { EVMCustomEventProvider } from './CustomEvent.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface EVMWalletProvider extends WalletAPI.Provider<ChainId, ProviderType> {
    /** Create an instance that implement the wallet protocol. */
    createWeb3Provider(options?: WalletAPI.ProviderOptions<ChainId>): Web3Provider
}

export let EVMWalletProviders: ReturnType<typeof createEVMWalletProviders>
export function createEVMWalletProviders() {
    const p = {
        [ProviderType.None]: new EVMNoneProvider(),
        [ProviderType.CustomEvent]: new EVMCustomEventProvider(),
    } satisfies Record<ProviderType, EVMWalletProvider>
    EVMWalletProviders = p
    return p
}
