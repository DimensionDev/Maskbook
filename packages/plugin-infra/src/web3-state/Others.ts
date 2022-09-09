import {
    ChainDescriptor,
    createChainResolver,
    createExplorerResolver,
    createNetworkResolver,
    createProviderResolver,
    isSameAddress,
    NetworkDescriptor,
    ProviderDescriptor,
    OthersState as Web3OthersState,
} from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

export class OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction>
    implements Web3OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction>
{
    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected options: {
            /** Built-in chain descriptors */
            chainDescriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>
            /** Built-in network descriptors */
            networkDescriptors: Array<NetworkDescriptor<ChainId, NetworkType>>
            /** Built-in provider descriptors */
            providerDescriptors: Array<ProviderDescriptor<ChainId, ProviderType>>
        },
    ) {}

    getDefaultChainId(): ChainId {
        throw new Error('Method not implemented.')
    }
    getDefaultNetworkType(): NetworkType {
        throw new Error('Method not implemented.')
    }
    getDefaultProviderType(): ProviderType {
        throw new Error('Method not implemented.')
    }

    chainResolver = createChainResolver<ChainId, SchemaType, NetworkType>(this.options.chainDescriptors)
    explorerResolver = createExplorerResolver<ChainId, SchemaType, NetworkType>(this.options.chainDescriptors)
    providerResolver = createProviderResolver<ChainId, ProviderType>(this.options.providerDescriptors)
    networkResolver = createNetworkResolver<ChainId, NetworkType>(this.options.networkDescriptors)

    getZeroAddress(): string | undefined {
        throw new Error('Method not implemented.')
    }
    getNativeTokenAddress(chainId?: ChainId): string | undefined {
        throw new Error('Method not implemented.')
    }
    getMaskTokenAddress(chainId?: ChainId): string | undefined {
        return undefined
    }
    getAverageBlockDelay(chainId: ChainId, scale = 1): number {
        const descriptor = this.options.networkDescriptors.find((x) => x.chainId === chainId)
        return (descriptor?.averageBlockDelay ?? 15) * scale * 1000
    }
    getTransactionSignature(chainId?: ChainId, transaction?: Transaction | undefined): string | undefined {
        return
    }

    isSameAddress = isSameAddress

    isZeroAddress(address?: string): boolean {
        throw new Error('Method not implemented.')
    }
    isNativeTokenAddress(address?: string): boolean {
        throw new Error('Method not implemented.')
    }
    isValidChain(chainId: ChainId, testnet = false): boolean {
        const descriptor = this.options.chainDescriptors.find((x) => x.chainId === chainId)
        return descriptor?.network === 'mainnet' || testnet
    }
    isValidDomain(domain: string): boolean {
        throw new Error('Method not implemented.')
    }
    isValidAddress(address: string): boolean {
        throw new Error('Method not implemented.')
    }

    formatAddress(address: string, size?: number | undefined): string {
        throw new Error('Method not implemented.')
    }
    formatTokenId(id?: string | undefined, size?: number | undefined): string {
        throw new Error('Method not implemented.')
    }
    formatDomainName(domain?: string | undefined, size?: number | undefined): string {
        throw new Error('Method not implemented.')
    }
    formatSchemaType(schema: SchemaType): string {
        throw new Error('Method not implemented.')
    }
}
