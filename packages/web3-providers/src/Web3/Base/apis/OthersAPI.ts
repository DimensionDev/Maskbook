import type { NetworkPluginID } from '@masknet/shared-base'
import { type FungibleToken, type NonFungibleToken, isSameAddress } from '@masknet/web3-shared-base'

export class OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
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

    getZeroAddress(): string | undefined {
        throw new Error('Method not implemented.')
    }
    getNativeTokenAddress(chainId?: ChainId): string | undefined {
        throw new Error('Method not implemented.')
    }
    getMaskTokenAddress(chainId?: ChainId): string | undefined {
        throw new Error('Method not implemented.')
    }
    getAverageBlockDelay(chainId: ChainId, scale = 1): number {
        throw new Error('Method not implemented.')
    }
    getTransactionSignature(chainId?: ChainId, transaction?: Transaction | undefined): string | undefined {
        throw new Error('Method not implemented.')
    }

    isSameAddress = isSameAddress

    isZeroAddress(address?: string): boolean {
        throw new Error('Method not implemented.')
    }
    isNativeTokenAddress(address?: string): boolean {
        throw new Error('Method not implemented.')
    }
    isValidChain(chainId: ChainId, testnet = false): boolean {
        throw new Error('Method not implemented.')
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
