import type { RequestArguments } from 'web3-core'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import type { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseProvider } from './Base.js'
import { MaskWalletProvider } from './MaskWallet.js'

/**
 * EIP-4337 compatible smart contract based wallet.
 */
export class SCWalletProvider extends BaseProvider implements EVM_Provider {
    private mask = new MaskWalletProvider()

    constructor(protected override providerType: ProviderType) {
        super(providerType)
    }

    override switchChain(chainId?: ChainId): Promise<void> {
        throw new Error('A SC wallet cannot switch chain.')
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        return this.mask.request(requestArguments, options)
    }
}
