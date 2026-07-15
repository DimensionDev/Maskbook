import { Emitter } from '@servie/events'
import type { Account } from '@masknet/shared-base'
import type { ChainId, ProviderType, Web3Provider } from '@masknet/web3-shared-flow'
import type { WalletAPI } from '../../../entry-types.js'
import type { FlowWalletProvider } from './index.js'

export abstract class BaseFlowWalletProvider implements FlowWalletProvider {
    readyPromise?: Promise<void> | undefined
    emitter = new Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>()

    get subscription(): FlowWalletProvider['subscription'] | undefined {
        return undefined
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style -- this is the abstract class default implementation, will be overridden by the subclass. class fields cannot be overridden.
    get connected() {
        return false
    }

    // No need to wait by default
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style -- this is the abstract class default implementation, will be overridden by the subclass. class fields cannot be overridden.
    get ready() {
        return true
    }

    switchChain(chainId?: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }
    createWeb3Provider(options?: WalletAPI.ProviderOptions<ChainId>): Web3Provider {
        throw new Error('Method not implemented.')
    }
    connect(chainId?: ChainId): Promise<Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
