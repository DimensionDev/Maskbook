import { Attachment } from '@dimensiondev/common-protocols'
import { encodeArrayBuffer, encodeText } from '@dimensiondev/kit'
import Arweave from 'arweave/web'
import type Transaction from 'arweave/web/lib/transaction'
import { isEmpty, isNil } from 'lodash-unified'
import { landing, mesonPrefix } from '../constants'
import { sign } from './remote-signing'
import TOKEN from './arweave-token.json'

const stage: Record<Transaction['id'], Transaction> = {}

const instance = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
})

export interface AttachmentOptions {
    key?: string | null
    type: string
    block: Uint8Array
}

export async function makeAttachment(options: AttachmentOptions) {
    const passphrase = options.key ? encodeText(options.key) : undefined
    const encoded = await Attachment.encode(passphrase, {
        block: options.block,
        mime: isEmpty(options.type) ? 'application/octet-stream' : options.type,
        metadata: null,
    })
    const transaction = await makePayload(encoded, 'application/octet-stream')
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
    useCDN: boolean
}

export async function uploadLandingPage(metadata: LandingPageMetadata) {
    let linkPrefix: string = 'https://arweave.net'
    if (metadata.useCDN) {
        linkPrefix = mesonPrefix
    }
    const encodedMetadata = JSON.stringify({
        name: metadata.name,
        size: metadata.size,
        link: `${linkPrefix}/${metadata.txId}`,
        signed: await makeFileKeySigned(metadata.key),
        createdAt: new Date().toISOString(),
    })
    const response = await fetch(landing)
    const text = await response.text()
    const replaced = text.replace('__METADATA__', encodedMetadata)
    const data = encodeText(replaced)
    const transaction = await makePayload(data, 'text/html')
    await instance.transactions.post(transaction)
    return transaction.id
}

async function makePayload(data: Uint8Array, type: string) {
    const transaction = await instance.createTransaction({ data }, TOKEN as any)
    transaction.addTag('Content-Type', type)
    await sign(transaction)
    return transaction
}

async function makeFileKeySigned(fileKey: string | undefined | null) {
    if (isNil(fileKey)) {
        return null
    }
    const encodedKey = encodeText(fileKey)
    const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: { name: 'SHA-256' } }, true, ['sign', 'verify'])
    const exportedKey = await crypto.subtle.exportKey('raw', key)
    const signed = await crypto.subtle.sign({ name: 'HMAC' }, key, encodedKey)
    return [signed, exportedKey].map(encodeArrayBuffer)
}
