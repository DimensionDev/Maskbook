import { type AttachmentOptions, type LandingPageMetadata, Provider, type ProviderAgent } from '../types.js'
import arweave from './arweave.js'
import ipfs from './ipfs.js'

const allProviders: Record<Provider, ProviderAgent> = {
    [Provider.Arweave]: arweave,
    [Provider.IPFS]: ipfs,
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

export { deleteFile, getAllFiles, renameFile, setFileInfo } from './database.js'
