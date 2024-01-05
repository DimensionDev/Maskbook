import { Emitter } from '@servie/events'
import { EMPTY_LIST, createConstantSubscription, type Account, type Wallet } from '@masknet/shared-base'
import { ChainId, type ProviderType, type Web3Provider } from '@masknet/web3-shared-flow'
import type { WalletAPI } from '../../../entry-types.js'
import type { FlowWalletProvider } from './index.js'

export abstract class BaseFlowWalletProvider implements FlowWalletProvider {
    emitter = new Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>()

    get subscription() {
        return {
            account: createConstantSubscription(''),
            chainId: createConstantSubscription(ChainId.Mainnet),
            wallets: createConstantSubscription<Wallet[]>(EMPTY_LIST),
        }
    }

    get connected() {
        return false
    }

    // No need to wait by default
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
