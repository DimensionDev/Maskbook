import type { NetworkPluginID } from '@masknet/shared-base'
import {
    type ChainDescriptor,
    type NetworkDescriptor,
    type ProviderDescriptor,
    type FungibleToken,
    type NonFungibleToken,
    createChainResolver,
    createExplorerResolver,
    createNetworkResolver,
    createProviderResolver,
    isSameAddress,
} from '@masknet/web3-shared-base'

export class OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    constructor(
        protected options: {
            /** Built-in chain descriptors */
            chainDescriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>
            /** Built-in network descriptors */
            networkDescriptors: Array<NetworkDescriptor<ChainId, NetworkType>>
            /** Built-in provider descriptors */
            providerDescriptors: Array<ProviderDescriptor<ChainId, ProviderType>>
        },
    ) {}

    getNetworkPluginID(): NetworkPluginID {
        throw new Error('Method not implemented.')
    }
    getDefaultChainId(): ChainId {
        throw new Error('Method not implemented.')
    }
    getInvalidChainId(): ChainId {
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
        const delay = this.options.networkDescriptors.find((x) => x.chainId === chainId)?.averageBlockDelay ?? 10
        return delay * scale * 1000
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
    isValidChainId(chainId: ChainId): boolean {
        throw new Error('Method not implemented.')
    }
    isValidDomain(domain: string): boolean {
        throw new Error('Method not implemented.')
    }
    isValidAddress(address: string): boolean {
        throw new Error('Method not implemented.')
    }

    isNativeTokenSchemaType(schemaType?: SchemaType | undefined): boolean {
        throw new Error('Method not implemented.')
    }
    isFungibleTokenSchemaType(schemaType?: SchemaType | undefined): boolean {
        throw new Error('Method not implemented.')
    }
    isNonFungibleTokenSchemaType(schemaType?: SchemaType | undefined): boolean {
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
    createNativeToken(chainId: ChainId): FungibleToken<ChainId, SchemaType> {
        throw new Error('Method not implemented.')
    }
    createFungibleToken(
        chainId: ChainId,
        schemaType: SchemaType,
        address: string,
        name?: string,
        symbol?: string,
        decimals?: number,
        logoURI?: string,
    ): FungibleToken<ChainId, SchemaType> {
        throw new Error('Method not implemented.')
    }
    createNonFungibleToken(
        chainId: ChainId,
        address: string,
        schemaType: SchemaType,
        tokenId: string,
        ownerId?: string,
        metadata?: NonFungibleToken<ChainId, SchemaType>['metadata'],
        contract?: NonFungibleToken<ChainId, SchemaType>['contract'],
        collection?: NonFungibleToken<ChainId, SchemaType>['collection'],
    ): NonFungibleToken<ChainId, SchemaType> {
        throw new Error('Method not implemented.')
    }
}
