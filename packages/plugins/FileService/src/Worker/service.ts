import { AttachmentOptions, Provider, ProviderAgent } from '../types'
import arweave from './arweave'
import ipfs from './ipfs'
import swarm from './swarm'

const allProviders: Record<Provider, ProviderAgent> = {
    [Provider.arweave]: arweave,
    [Provider.ipfs]: ipfs,
    [Provider.swarm]: swarm,
}

export async function makeAttachment(provider: Provider, options: AttachmentOptions) {
    return allProviders[provider]?.makeAttachment(options)
}

export async function* upload(provider: Provider, id: string) {
    for await (const percent of allProviders[provider].upload(id)) {
        yield percent
    }
}

export async function uploadLandingPage(provider: Provider, metadata: any) {
    return allProviders[provider]?.uploadLandingPage(metadata)
}

export * from './database'
