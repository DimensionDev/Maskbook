import type { NetworkPluginID } from '@masknet/shared-base'
import { type FungibleToken, type NonFungibleToken } from '@masknet/web3-shared-base'
import type { ProviderResolver } from './ProviderResolver.js'
import type { NetworkResolver } from './NetworkExplorer.js'
import type { ChainResolver } from './ChainResolver.js'
import type { ExplorerResolver } from './ExplorerResolver.js'

export interface BaseUtils<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    readonly chainResolver: ChainResolver<ChainId, SchemaType, NetworkType>
    readonly explorerResolver: ExplorerResolver<ChainId, SchemaType, NetworkType>
    readonly providerResolver: ProviderResolver<ChainId, ProviderType>
    readonly networkResolver: NetworkResolver<ChainId, NetworkType>

    getNetworkPluginID(): NetworkPluginID

    getDefaultChainId(): ChainId

    getInvalidChainId?(): ChainId

    getDefaultNetworkType(): NetworkType

    getDefaultProviderType(): ProviderType

    getZeroAddress(): string | undefined

    getNativeTokenAddress(chainId?: ChainId): string | undefined

    getMaskTokenAddress(chainId?: ChainId): string | undefined

    getAverageBlockDelay?(chainId: ChainId, scale?: number): number

    getTransactionSignature?(chainId?: ChainId, transaction?: Transaction | undefined): string | undefined

    isSameAddress(address?: string | undefined, otherAddress?: string | undefined): boolean

    isZeroAddress(address?: string): boolean

    isNativeTokenAddress(address?: string): boolean

    isValidChain?(chainId: ChainId, testnet?: boolean): boolean

    isValidChainId(chainId: ChainId): boolean

    isValidDomain(domain: string): boolean

    isValidAddress(address: string): boolean

    isNativeTokenSchemaType(schemaType?: SchemaType | undefined): boolean

    isFungibleTokenSchemaType(schemaType?: SchemaType | undefined): boolean

    isNonFungibleTokenSchemaType(schemaType?: SchemaType | undefined): boolean

    formatAddress(address: string, size?: number | undefined): string

    formatTokenId(id?: string | undefined, size?: number | undefined): string

    formatDomainName(domain?: string | null | undefined, size?: number | undefined): string

    formatSchemaType(schema: SchemaType): string

    createNativeToken(chainId: ChainId): FungibleToken<ChainId, SchemaType>

    createFungibleToken(
        chainId: ChainId,
        schemaType: SchemaType,
        address: string,
        name?: string,
        symbol?: string,
        decimals?: number,
        logoURI?: string,
    ): FungibleToken<ChainId, SchemaType>

    createNonFungibleToken(
        chainId: ChainId,
        address: string,
        schemaType: SchemaType,
        tokenId: string,
        ownerId?: string,
        metadata?: NonFungibleToken<ChainId, SchemaType>['metadata'],
        contract?: NonFungibleToken<ChainId, SchemaType>['contract'],
        collection?: NonFungibleToken<ChainId, SchemaType>['collection'],
    ): NonFungibleToken<ChainId, SchemaType>
}
