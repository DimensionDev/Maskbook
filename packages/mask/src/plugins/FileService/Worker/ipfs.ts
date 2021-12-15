import { Attachment } from '@dimensiondev/common-protocols'
import { encodeArrayBuffer, encodeText } from '@dimensiondev/kit'
import { create } from 'ipfs-http-client'
import { isEmpty, isNil } from 'lodash-unified'
import { landing } from '../constants'

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
    const fileHash = await makePayload(encoded, 'application/octet-stream')
    return fileHash
}

// import { ServicesWithProgress } from 'src/extension/service.ts'
// ServicesWithProgress.pluginArweaveUpload
export async function* upload(id: string) {
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
    let linkPrefix: string = 'https://ipfs.infura.io/ipfs'
    const encodedMetadata = JSON.stringify({
        name: metadata.name,
        size: metadata.size,
        link: `${linkPrefix}/${metadata.txId}`,
        signed: await makeFileKeySigned(metadata.key),
        createdAt: new Date().toISOString(),
    })
    const response = await fetch(landing)
    const text = await response.text()
    const replaced = text
        .replace('Arweave', 'IPFS')
        .replace('Over Arweave', "Over IPFS")
        .replace('__METADATA__', encodedMetadata)
    const data = encodeText(replaced)
    const fileHash = await makePayload(data, 'text/html')
    return fileHash
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
