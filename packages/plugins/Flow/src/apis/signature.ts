import { Buffer } from 'buffer'
import { ChainId, createClient } from '@masknet/web3-shared-flow'
import type { CompositeSignatures } from '@blocto/fcl'

export async function signUserMessage(chainId: ChainId, message: string) {
    const sdk = createClient(chainId)
    return sdk.currentUser.signUserMessage(Buffer.from(message).toString('hex'))
}

export async function verifyUserSignatures(chainId: ChainId, message: string, signature: CompositeSignatures[]) {
    const sdk = createClient(chainId)
    return sdk.verifyUserSignatures(message, signature)
}
