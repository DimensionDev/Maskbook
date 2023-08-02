import type { NetworkDescriptor } from '@masknet/web3-shared-base'

export class NetworkResolverAPI_Base<ChainId, NetworkType> {
    constructor(private descriptors: Array<NetworkDescriptor<ChainId, NetworkType>>) {}

    private getDescriptor(networkType: NetworkType) {
        return this.descriptors.find((x) => x.type === networkType)!
    }

    networkIcon = (networkType: NetworkType) => this.getDescriptor(networkType).icon

    networkIconColor = (networkType: NetworkType) => this.getDescriptor(networkType).iconColor

    networkName = (networkType: NetworkType) => this.getDescriptor(networkType).name

    networkChainId = (networkType: NetworkType) => this.getDescriptor(networkType).chainId
}
