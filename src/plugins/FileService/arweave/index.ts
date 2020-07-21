import { Attachment } from '@dimensiondev/common-protocols'
import Arweave from 'arweave/web'
import type Transaction from 'arweave/web/lib/transaction'
import { landing } from '../constants'
import { sign } from './remote-signing'
import token from './token.json'
import { isNil } from 'lodash-es'

const stage: Record<Transaction['id'], Transaction> = {}

const instance = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
})

export function makeFileKey(length = 16) {
    let key = ''
    const table = 'ABDEFGHJKMNPQRTWXYadefhijkmnprstuvwxyz03478'
    for (let i = 0; i < length; i += 1) {
        key += table.charAt(Math.floor(Math.random() * table.length))
    }
    return key
}

export interface AttachmentOptions {
    key?: string | null
    type: string
    block: Uint8Array
}

export async function makeAttachment(options: AttachmentOptions) {
    const passphrase = options.key ? new TextEncoder().encode(options.key) : undefined
    const encoded = await Attachment.encode(passphrase, {
        block: options.block,
        metadata: null,
        mime: options.type,
    })
    const transaction = await makePayload(encoded, options.type)
    stage[transaction.id] = transaction
    return transaction.id
}

// import { ServicesWithProgress } from 'src/extension/service.ts'
// ServicesWithProgress.pluginArweaveUpload
export async function* upload(id: Transaction['id']) {
    for await (const uploader of instance.transactions.upload(stage[id])) {
        yield uploader.pctComplete
    }
}

export interface LandingPageMetadata {
    key: string | null | undefined
    name: string
    size: number
    type: string
    txId: string
}

export async function uploadLandingPage(metadata: LandingPageMetadata) {
    let keyHash
    if (!isNil(metadata.key)) {
        const hash = await Attachment.checksum(Buffer.from(metadata.key, 'utf-8'))
        keyHash = Buffer.from(hash).toString('base64')
    }
    const encodedMetadata = JSON.stringify({
        name: metadata.name,
        size: metadata.size,
        link: `https://arweave.net/${metadata.txId}`,
        keyHash,
        createdAt: new Date().toISOString(),
        mime: metadata.type,
    })
    const response = await fetch(landing)
    const text = await response.text()
    const replaced = text.replace('__METADATA__', encodedMetadata)
    const data = new TextEncoder().encode(replaced)
    const transaction = await makePayload(data, 'text/html')
    await instance.transactions.post(transaction)
    return transaction.id
}

async function makePayload(data: Uint8Array, type: string) {
    const transaction = await instance.createTransaction({ data }, token as any)
    transaction.addTag('Content-Type', type)
    await sign(transaction)
    return transaction
}
