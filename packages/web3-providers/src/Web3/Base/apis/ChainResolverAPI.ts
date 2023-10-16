import type { ChainDescriptor } from '@masknet/web3-shared-base'

export abstract class ChainResolverAPI_Base<ChainId, SchemaType, NetworkType> {
    protected abstract readonly descriptors: ReadonlyArray<ChainDescriptor<ChainId, SchemaType, NetworkType>>
    private getDescriptor(chainId: ChainId) {
        return this.descriptors.find((x) => x.chainId === chainId)
    }

    private getDescriptorRequired(chainId: ChainId) {
        const descriptor = this.getDescriptor(chainId)
        if (!descriptor) throw new Error(`Unknown chainId: ${chainId}. It might too early to access network state.`)
        return descriptor
    }

    /**
     * Guess chain id by name, it's not perfectly accurate
     */
    chainId = (name: string) =>
        this.descriptors.find((x) =>
            [x.name, x.type as string, x.fullName, x.shortName]
                .map((x) => x?.toLowerCase())
                .filter(Boolean)
                .includes(name?.toLowerCase()),
        )?.chainId

    coinMarketCapChainId = (chainId: ChainId) => this.getDescriptor(chainId)?.coinMarketCapChainId ?? ''

    coinGeckoChainId = (chainId: ChainId) => this.getDescriptor(chainId)?.coinGeckoChainId ?? ''

    coinGeckoPlatformId = (chainId: ChainId) => this.getDescriptor(chainId)?.coinGeckoPlatformId ?? ''

    chainName = (chainId: ChainId) => this.getDescriptor(chainId)?.name ?? 'Custom Network'

    chainFullName = (chainId: ChainId) => this.getDescriptor(chainId)?.fullName ?? 'Custom Network'
    chainColor = (chainId: ChainId) => this.getDescriptor(chainId)?.color ?? 'rgb(138, 138, 138)'

    chainPrefix = (chainId: ChainId) => ''

    networkType = (chainId: ChainId) => this.getDescriptorRequired(chainId)?.type

    explorerUrl = (chainId: ChainId) => this.getDescriptorRequired(chainId)?.explorerUrl

    nativeCurrency = (chainId: ChainId) => this.getDescriptorRequired(chainId)?.nativeCurrency

    isValidChainId = (chainId: ChainId, testnet = false) =>
        this.getDescriptor(chainId)?.network === 'mainnet' || testnet

    isMainnet = (chainId: ChainId) => this.getDescriptor(chainId)?.network === 'mainnet'

    isFeatureSupported = (chainId: ChainId, feature: string) =>
        !!this.getDescriptor(chainId)?.features?.includes(feature)
}
