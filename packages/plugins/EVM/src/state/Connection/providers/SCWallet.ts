import type { RequestArguments } from 'web3-core'
import { encodePacked, keccak256 } from 'web3-utils'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import type { ChainId, ProviderType, Web3Provider } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseProvider } from './Base.js'

/**
 * EIP-4337 compatible smart contract based wallet.
 */
export class SCWalletProvider extends BaseProvider implements EVM_Provider {
    constructor(protected providerType: ProviderType) {
        super()
    }

    override async createWeb3Provider(options?: ProviderOptions<ChainId>): Promise<Web3Provider> {
        throw new Error('To be implemented')
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        const provider = await this.createWeb3Provider(options)
        return provider.request(requestArguments) as Promise<T>
    }

    /**
     * Get SC wallet address (a.k.a. the sender address) at given nonce
     * @param nonce
     * @returns
     */
    protected getAccount(chainId: ChainId, nonce = 0): string {
        const initCode = this.createInitCode(chainId)
        const EP = this.getCreate2FactoryContractAddress(chainId)
        if (!EP) return ''
        const hash = encodePacked('0xff', EP, nonce, keccak256(initCode)) ?? ''
        // TODO: cast to a EVM address
        return hash
    }

    protected createInitCode(chainId: ChainId): string {
        throw new Error('To be implemented')
    }

    protected getEPContractAddress(chainId: ChainId): string | undefined {
        throw new Error('To be implemented')
    }

    protected getCreate2FactoryContractAddress(chainId: ChainId): string | undefined {
        throw new Error('To be implemented')
    }

    override async connect(): Promise<{ chainId: ChainId; account: string }> {
        throw new Error('To be implemented')
    }

    override async disconnect(): Promise<void> {
        throw new Error('To be implemented')
    }

    protected async deploy(nonce: number): Promise<void> {
        throw new Error('To be implemented')
    }
}
