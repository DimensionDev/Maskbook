import type { RequestArguments } from 'web3-core'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import type { ChainId, ProviderType, Web3Provider } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseProvider } from './Base.js'

/**
 * EIP-4338 compatible smart contract based wallet.
 */
export class SCWalletProvider extends BaseProvider implements EVM_Provider {
    constructor(protected providerType: ProviderType) {
        super()
    }

    override async createWeb3Provider(options?: ProviderOptions<ChainId>): Promise<Web3Provider> {
        throw new Error('To be implemented.')
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        const provider = await this.createWeb3Provider(options)
        return provider.request(requestArguments) as Promise<T>
    }

    override async connect(): Promise<{ chainId: ChainId; account: string }> {
        throw new Error('To be implemented.')
    }

    override async disconnect(): Promise<void> {
        throw new Error('To be implemented.')
    }

    protected async deploy(): Promise<void> {}
}
