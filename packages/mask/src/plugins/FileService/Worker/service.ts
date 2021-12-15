
import type { Provider } from '../types'
import * as arweave from './arweave'
import * as ipfs from './ipfs'
import * as swarm from './swarm'

const allProviders: Record<Provider, any> = {
  arweave,
  ipfs,
  swarm
}

export async function makeAttachment(provider: Provider, options: any) {
  return allProviders[provider]?.makeAttachment(options);
}

export async function* upload(provider: Provider, id: any) {
  return allProviders[provider]?.upload(id);
}

export async function uploadLandingPage(provider: Provider, metadata: any) {
  return allProviders[provider]?.uploadLandingPage(metadata);
}

export * from './database'
