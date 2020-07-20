import { Attachment } from '@dimensiondev/common-protocols'
import Arweave from 'arweave/web'
import type Transaction from 'arweave/web/lib/transaction'
import { sign } from './remote-signing'
import token from './token.json'

export const landingPage = 'https://files.maskbook.com/partner/arweave/landing-page.html'

const instance = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
})

export interface AttachmentOptions {
    key?: string
    block: Uint8Array
    type: string
}

export async function makeAttachment(options: AttachmentOptions) {
    const passphrase = options.key ? new TextEncoder().encode(options.key) : undefined
    return Attachment.encode(passphrase, {
        block: options.block,
        metadata: null,
        mime: options.type,
    })
}

export async function makePayload(data: Uint8Array, type = 'application/octet-stream') {
    const transaction = await instance.createTransaction({ data }, token as any)
    transaction.addTag('Content-Type', type)
    await sign(transaction)
    return transaction
}

export interface LandingPageMetadata {
    name: string
    size: number
    tx: Transaction
    key?: string
    type: string
}

export async function makeLandingPage(metadata: LandingPageMetadata) {
    const keyHash = metadata.key ? Attachment.checksum(new TextEncoder().encode(metadata.key)) : undefined
    const encodedMetadata = JSON.stringify({
        name: metadata.name,
        size: metadata.size,
        link: `https://arweave.net/${metadata.tx.id}`,
        keyHash,
        createdAt: new Date().toISOString(),
        mime: metadata.type,
    })
    const response = await fetch(landingPage)
    const text = await response.text()
    const replaced = text.replace('__METADATA__', encodedMetadata)
    const data = new TextEncoder().encode(replaced)

    const transaction = await instance.createTransaction({ data }, token as any)
    transaction.addTag('Content-Type', 'text/html')
    await sign(transaction)
    return transaction
}
