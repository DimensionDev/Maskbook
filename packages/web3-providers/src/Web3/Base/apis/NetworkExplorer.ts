import type { NetworkDescriptor } from '@masknet/web3-shared-base'

export class NetworkResolver<ChainId, NetworkType> {
    constructor(private descriptors: () => ReadonlyArray<NetworkDescriptor<ChainId, NetworkType>>) {}

    private getDescriptor(networkType: NetworkType) {
        return this.descriptors().find((x) => x.type === networkType)
    }

    networkIcon(networkType: NetworkType) {
        return this.getDescriptor(networkType)?.icon
    }

    networkChainId(networkType: NetworkType) {
        return this.getDescriptor(networkType)?.chainId
    }
}
