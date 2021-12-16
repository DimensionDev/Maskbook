import { Attachment } from '@dimensiondev/common-protocols'
import { encodeArrayBuffer, encodeText } from '@dimensiondev/kit'
import { create } from 'ipfs-http-client'
import { isEmpty, isNil } from 'lodash-unified'
import { landing } from '../constants'
import urlcat from 'urlcat'

const providerName = 'IPFS'
const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
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
    return makePayload(encoded, 'application/octet-stream')
}

export async function* upload(id: string) {
    return 100
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
    const linkPrefix: string = 'https://ipfs.infura.io/ipfs'
    const encodedMetadata = JSON.stringify({
        name: metadata.name,
        size: metadata.size,
        link: urlcat(linkPrefix, '/:txId', { txId: metadata.txId }),
        signed: await makeFileKeySigned(metadata.key),
        createdAt: new Date().toISOString(),
    })
    const response = await fetch(landing)
    const text = await response.text()
    const replaced = text
        .replace('Arweave', providerName)
        .replace('Over Arweave', `Over ${providerName}`)
        .replace('__METADATA__', encodedMetadata)
    const data = encodeText(replaced)
    return makePayload(data, 'text/html')
}

async function makePayload(data: Uint8Array, type: string) {
    const file = await client.add(data)
    return file.cid.toString()
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
