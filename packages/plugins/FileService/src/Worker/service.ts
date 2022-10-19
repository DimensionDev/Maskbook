import { AttachmentOptions, LandingPageMetadata, Provider, ProviderAgent } from '../types.js'
import arweave from './arweave.js'
import ipfs from './ipfs.js'

const allProviders: Record<Provider, ProviderAgent> = {
    [Provider.arweave]: arweave,
    [Provider.ipfs]: ipfs,
}

export async function makeAttachment(provider: Provider, options: AttachmentOptions) {
    return allProviders[provider]?.makeAttachment(options)
}

export async function* upload(provider: Provider, id: string) {
    for await (const percent of allProviders[provider].upload(id)) {
        yield percent
    }
}

export async function uploadLandingPage(provider: Provider, metadata: LandingPageMetadata) {
    return allProviders[provider]?.uploadLandingPage(metadata)
}

export * from './database.js'
