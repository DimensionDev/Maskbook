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

export class OthersState<ChainId, SchemaType, ProviderType, NetworkType>
    implements Web3OthersState<ChainId, SchemaType, ProviderType, NetworkType>
{
    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected options: {
            /** Default address or nullish address */
            defaultAddress: string
            /** Default block time in seconds */
            defaultBlockDelay: number
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

    chainResolver = createChainResolver<ChainId, SchemaType, NetworkType>(this.options.chainDescriptors)
    explorerResolver = createExplorerResolver<ChainId, SchemaType, NetworkType>(this.options.chainDescriptors)
    providerResolver = createProviderResolver<ChainId, ProviderType>(this.options.providerDescriptors)
    networkResolver = createNetworkResolver<ChainId, NetworkType>(this.options.networkDescriptors)

    getZeroAddress(chainId?: ChainId | undefined): string {
        return this.options.defaultAddress
    }
    getNativeTokenAddress(chainId?: ChainId | undefined): string {
        return this.options.defaultAddress
    }
    getMaskTokenAddress(chainId?: ChainId | undefined): string | undefined {
        return
    }
    getAverageBlockDelay(chainId: ChainId, scale = 1): number {
        return this.options.defaultBlockDelay * scale * 1000
    }

    isSameAddress = isSameAddress

    isValidChain(chainId: ChainId, testnet = false): boolean {
        return this.options.chainDescriptors.find((x) => x.chainId === chainId)?.network === 'mainnet' || testnet
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
}
