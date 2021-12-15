import { Attachment } from '@dimensiondev/common-protocols'
import { encodeArrayBuffer, encodeText } from '@dimensiondev/kit'
import { Bee, Data, FileData, Reference } from '@ethersphere/bee-js'

import { isEmpty, isNil } from 'lodash-unified'
import { landing, mesonPrefix } from '../constants'

const BEE_HOSTS: string[] =  "https://bee-0.gateway.ethswarm.org,https://bee-1.gateway.ethswarm.org,https://bee-2.gateway.ethswarm.org,https://bee-3.gateway.ethswarm.org,https://bee-4.gateway.ethswarm.org,https://bee-5.gateway.ethswarm.org,https://bee-6.gateway.ethswarm.org,https://bee-7.gateway.ethswarm.org,https://bee-8.gateway.ethswarm.org,https://bee-9.gateway.ethswarm.org".split(',')
const randomIndex = Math.floor(Math.random() * BEE_HOSTS.length)
const randomBee = new Bee(BEE_HOSTS[randomIndex])
const POSTAGE_STAMP = '0000000000000000000000000000000000000000000000000000000000000000'
// const GATEWAY_URL = 'https://gateway.ethswarm.org/';

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
    const fileHash = await makePayload(encoded, 'application/octet-stream', options.name)
    return fileHash
}

// import { ServicesWithProgress } from 'src/extension/service.ts'
// ServicesWithProgress.pluginArweaveUpload
export async function* upload(id: string) {
    // for await (const uploader of instance.transactions.upload(stage[id])) {
    //     yield uploader.pctComplete
    // }
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
    let linkPrefix: string = 'https://bee-2.gateway.ethswarm.org/bzz'
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
        .replace('Arweave', 'Swarm')
        .replace('Over Arweave', "Over Swarm")
        .replace('__METADATA__', encodedMetadata)
    const data = encodeText(replaced)
    const fileHash = await makePayload(data, 'text/html', metadata.name)
    console.log('uploadLandingPage', fileHash)
    return fileHash
}

function hashToIndex(hash: Reference | string) {
  const n = parseInt(hash.slice(0, 8), 16)
  return n % BEE_HOSTS.length
}

async function makePayload(data: Uint8Array, type: string, name: string) {
    const { reference } = await randomBee.uploadFile(POSTAGE_STAMP, data, name, {
        encrypt: false,
        size: data.length,
        contentType: type,
        indexDocument: type == 'text/html'
    })
    console.log('reference', reference, type)
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
