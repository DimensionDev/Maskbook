import type { ProviderDescriptor } from '@masknet/web3-shared-base'

export class ProviderResolver<ChainId, ProviderType> {
    constructor(private descriptors: () => ReadonlyArray<ProviderDescriptor<ChainId, ProviderType>>) {}

    private getDescriptor(providerType: ProviderType) {
        return this.descriptors().find((x) => x.type === providerType)
    }

    providerName(providerType: ProviderType) {
        return this.getDescriptor(providerType)?.name
    }

    providerHomeLink(providerType: ProviderType) {
        return this.getDescriptor(providerType)?.homeLink
    }

    providerShortenLink(providerType: ProviderType) {
        return this.getDescriptor(providerType)?.shortenLink
    }

    providerDownloadLink(providerType: ProviderType) {
        return this.getDescriptor(providerType)?.downloadLink
    }
}
