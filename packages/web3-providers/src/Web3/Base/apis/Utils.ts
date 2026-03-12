import type { NetworkResolver } from './NetworkExplorer.js'
import type { ChainResolver } from './ChainResolver.js'
import type { ExplorerResolver } from './ExplorerResolver.js'

export interface BaseUtils<ChainId, SchemaType, NetworkType> {
    readonly chainResolver: ChainResolver<ChainId, SchemaType, NetworkType>
    readonly explorerResolver: ExplorerResolver<ChainId, SchemaType, NetworkType>
    readonly networkResolver: NetworkResolver<ChainId, NetworkType>

    getDefaultChainId(): ChainId

    getNativeTokenAddress(chainId?: ChainId): string | undefined

    getMaskTokenAddress(chainId?: ChainId): string | undefined

    getAverageBlockDelay?(chainId: ChainId, scale?: number): number

    isNativeTokenAddress(address?: string): boolean

    isValidChainId(chainId: ChainId): boolean

    isValidDomain(domain: string): boolean

    isValidAddress(address: string): boolean

    formatAddress(address: string, size?: number | undefined): string

    formatTokenId(id?: string | undefined, size?: number | undefined): string

    formatDomainName(domain?: string | null | undefined, size?: number | undefined): string

    formatSchemaType(schema: SchemaType): string
}
