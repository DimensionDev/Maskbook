import { Emitter } from '@servie/events'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, FclProvider } from '@masknet/web3-shared-flow'
import type { FlowProvider, FlowWeb3 } from '../types'

export class BaseProvider implements FlowProvider {
    emitter = new Emitter<Web3Plugin.ProviderEvents<ChainId>>()

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    switchChain(chainId?: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }
    createWeb3(chainId?: ChainId): Promise<FlowWeb3> {
        throw new Error('Method not implemented.')
    }
    createWeb3Provider(chainId?: ChainId): Promise<FclProvider> {
        throw new Error('Method not implemented.')
    }
    connect(chainId?: ChainId): Promise<Web3Plugin.Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
