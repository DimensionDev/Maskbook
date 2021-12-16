import { Attachment } from '@dimensiondev/common-protocols'
import { encodeArrayBuffer, encodeText } from '@dimensiondev/kit'
import { Bee, Reference, CollectionEntry } from '@ethersphere/bee-js'
import urlcat from 'urlcat'
import { isEmpty, isNil } from 'lodash-unified'
import { landing } from '../constants'

const BEE_HOSTS: string[] = [
    'https://bee-0.gateway.ethswarm.org',
    'https://bee-1.gateway.ethswarm.org',
    'https://bee-2.gateway.ethswarm.org',
    'https://bee-3.gateway.ethswarm.org',
    'https://bee-4.gateway.ethswarm.org',
    'https://bee-5.gateway.ethswarm.org',
    'https://bee-6.gateway.ethswarm.org',
    'https://bee-7.gateway.ethswarm.org',
    'https://bee-8.gateway.ethswarm.org',
    'https://bee-9.gateway.ethswarm.org',
]

const randomIndex = Math.floor(Math.random() * BEE_HOSTS.length)
const randomBee = new Bee(BEE_HOSTS[randomIndex])
const POSTAGE_STAMP = '0000000000000000000000000000000000000000000000000000000000000000'
const providerName = 'IPFS'

export interface AttachmentOptions {
    key?: string | null
    name: string
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
    return makePayload(encoded, 'application/octet-stream', options.name)
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
    const linkPrefix: string = 'https://bee-2.gateway.ethswarm.org/bzz'
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
    return makePayload(data, 'text/html', 'landing.html')
}

function hashToIndex(hash: Reference | string) {
    const n = Number.parseInt(hash.slice(0, 8), 16)
    return n % BEE_HOSTS.length
}

async function makePayload(data: Uint8Array, type: string, name: string) {
    const isHTML = type === 'text/html'
    if (isHTML) {
        const file: CollectionEntry<Uint8Array> = {
            path: name,
            data: data,
        }
        const { reference } = await randomBee.uploadCollection(POSTAGE_STAMP, [file], {
            encrypt: false,
            indexDocument: name,
        })
        return reference
    }
    const { reference } = await randomBee.uploadFile(POSTAGE_STAMP, data, name, {
        encrypt: false,
        size: data.length,
        contentType: type,
    })
    return reference
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
