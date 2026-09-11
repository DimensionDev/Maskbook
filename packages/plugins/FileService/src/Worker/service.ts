import { type AttachmentOptions, type LandingPageMetadata, Provider, type ProviderAgent } from '../types.js'
import arweave from './arweave.js'
import load from './load.js'

const allProviders: Partial<Record<Provider, ProviderAgent>> = {
    [Provider.Arweave]: arweave,
    [Provider.Load]: load,
}

function getProviderAgent(provider: Provider): ProviderAgent {
    const agent = allProviders[provider]
    if (!agent) throw new Error(`Provider ${provider} is no longer supported`)
    return agent
}

export async function makeAttachment(provider: Provider, options: AttachmentOptions) {
    return getProviderAgent(provider).makeAttachment(options)
}

export async function* upload(provider: Provider, id: string) {
    for await (const percent of getProviderAgent(provider).upload(id)) {
        yield percent
    }
}

export async function uploadLandingPage(provider: Provider, metadata: LandingPageMetadata) {
    return getProviderAgent(provider).uploadLandingPage(metadata)
}

export { deleteFile, getAllFiles, renameFile, setFileInfo } from './database.js'
