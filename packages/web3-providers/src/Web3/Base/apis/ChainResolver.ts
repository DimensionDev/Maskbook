import type { ChainDescriptor } from '@masknet/web3-shared-base'

export class ChainResolver<ChainId, SchemaType, NetworkType> {
    constructor(private readonly descriptors: () => ReadonlyArray<ChainDescriptor<ChainId, SchemaType, NetworkType>>) {}
    private getDescriptor(chainId: ChainId) {
        return this.descriptors().find((x) => x.chainId === chainId)
    }

    private getDescriptorRequired(chainId: ChainId) {
        const descriptor = this.getDescriptor(chainId)
        if (!descriptor) throw new Error(`Unknown chainId: ${chainId}. It might too early to access network state.`)
        return descriptor
    }

    /**
     * Guess chain id by name, it's not perfectly accurate
     */
    chainId(name: string) {
        return this.descriptors().find((x) =>
            [x.name, x.type as string, x.fullName, x.shortName]
                .map((x) => x?.toLowerCase())
                .filter(Boolean)
                .includes(name?.toLowerCase()),
        )?.chainId
    }
    chainName(chainId: ChainId) {
        return this.getDescriptor(chainId)?.name ?? 'Custom Network'
    }
    chainFullName(chainId: ChainId) {
        return this.getDescriptor(chainId)?.fullName ?? 'Custom Network'
    }
    chainColor(chainId: ChainId) {
        return this.getDescriptor(chainId)?.color ?? 'rgb(138, 138, 138)'
    }
    networkType(chainId: ChainId) {
        return this.getDescriptorRequired(chainId)?.type
    }
    explorerUrl(chainId: ChainId) {
        return this.getDescriptorRequired(chainId)?.explorerUrl
    }
    nativeCurrency(chainId: ChainId) {
        return this.getDescriptorRequired(chainId)?.nativeCurrency
    }
    isValidChainId(chainId: ChainId, testnet = false) {
        return this.getDescriptor(chainId)?.network === 'mainnet' || testnet
    }
    isMainnet(chainId: ChainId) {
        return this.getDescriptor(chainId)?.network === 'mainnet'
    }
    isFeatureSupported(chainId: ChainId, feature: string) {
        return !!this.getDescriptor(chainId)?.features?.includes(feature)
    }
}
