import * as arweave from './arweave'
import * as ipfs from './ipfs'
import * as swarm from './swarm'

const allProviders: any = {
  arweave,
  ipfs,
  swarm
}

export async function makeAttachment(provider: string, options: any) {
  return allProviders[provider].makeAttachment(options);
}

export async function* upload(provider: string, id: any) {
  return allProviders[provider].makeAttachment(id);
}

export async function uploadLandingPage(provider: string, metadata: any) {
  return allProviders[provider].uploadLandingPage(metadata);
}

export * from './database'
