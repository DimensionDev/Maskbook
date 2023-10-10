import type { ProviderDescriptor } from '@masknet/web3-shared-base'

export abstract class ProviderResolverAPI_Base<ChainId, ProviderType> {
    protected abstract readonly descriptors: ReadonlyArray<ProviderDescriptor<ChainId, ProviderType>>
    private getDescriptor(providerType: ProviderType) {
        return this.descriptors.find((x) => x.type === providerType)
    }

    providerName = (providerType: ProviderType) => this.getDescriptor(providerType)?.name

    providerHomeLink = (providerType: ProviderType) => this.getDescriptor(providerType)?.homeLink

    providerShortenLink = (providerType: ProviderType) => this.getDescriptor(providerType)?.shortenLink

    providerDownloadLink = (providerType: ProviderType) => this.getDescriptor(providerType)?.downloadLink
}
