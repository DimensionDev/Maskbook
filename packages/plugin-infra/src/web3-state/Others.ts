import {
    ChainDescriptor,
    createChainResolver,
    createExplorerResolver,
    createNetworkResolver,
    createProviderResolver,
    formatBalance,
    formatCurrency,
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
            chainDescriptors: ChainDescriptor<ChainId, SchemaType, NetworkType>[]
            /** Built-in network descriptors */
            networkDescriptors: NetworkDescriptor<ChainId, NetworkType>[]
            /** Built-in provider descriptors */
            providerDescriptors: ProviderDescriptor<ChainId, ProviderType>[]
        },
    ) {}
    getDefaultChainId(): ChainId {
        throw new Error('Method not implemented.')
    }
    getDefaultNetworkType(): NetworkType {
        throw new Error('Method not implemented.')
    }

    chainResolver = createChainResolver(this.options.chainDescriptors)
    explorerResolver = createExplorerResolver(this.options.chainDescriptors)
    providerResolver = createProviderResolver(this.options.providerDescriptors)
    networkResovler = createNetworkResolver(this.options.networkDescriptors)

    getZeroAddress(chainId?: ChainId | undefined): string {
        return this.options.defaultAddress
    }
    getNativeTokenAddress(chainId?: ChainId | undefined): string {
        return this.options.defaultAddress
    }
    getAverageBlockDelay(chainId: ChainId, scale = 1): number {
        return this.options.defaultBlockDelay * scale
    }

    isSameAddress = isSameAddress

    formatCurrency = formatCurrency
    formatBalance = formatBalance

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
