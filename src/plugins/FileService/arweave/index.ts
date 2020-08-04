import { Attachment } from '@dimensiondev/common-protocols'
import Arweave from 'arweave/web'
import type Transaction from 'arweave/web/lib/transaction'
import { landing } from '../constants'
import { sign } from './remote-signing'
import token from './token.json'
import { isNil, isEmpty } from 'lodash-es'

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
    const passphrase = options.key ? encodeText(options.key) : undefined
    const encoded = await Attachment.encode(passphrase, {
        block: options.block,
        metadata: null,
        mime: isEmpty(options.type) ? 'application/octet-stream' : options.type,
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
}

export async function uploadLandingPage(metadata: LandingPageMetadata) {
    const encodedMetadata = JSON.stringify({
        name: metadata.name,
        size: metadata.size,
        link: `https://arweave.net/${metadata.txId}`,
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
    const transaction = await instance.createTransaction({ data }, token as any)
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
    return [signed, exportedKey].map(encodeBase64)
}

function encodeText(input: string) {
    return new TextEncoder().encode(input)
}

function encodeBase64(data: ArrayBuffer) {
    return Buffer.from(data).toString('base64')
}
