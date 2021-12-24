import { type TypedMessage, createTypedMessageMetadataReader } from '@masknet/shared-base'
import { META_KEY_1, META_KEY_2 } from './constants'
import { FileInfo, FileInfoV1, Provider } from './types'
import schemaV1 from './schema-v1.json'
import schemaV2 from './schema-v2.json'
import type { Result } from 'ts-results'
import { isNil } from 'lodash-unified'
import { encodeArrayBuffer, encodeText, unreachable } from '@dimensiondev/kit'

const reader_v1 = createTypedMessageMetadataReader<FileInfoV1>(META_KEY_1, schemaV1)
const reader_v2 = createTypedMessageMetadataReader<FileInfo>(META_KEY_2, schemaV2)

export function FileInfoMetadataReader(meta: TypedMessage['meta']): Result<FileInfo, void> {
    const v2 = reader_v2(meta)
    if (v2.ok) return v2
    return reader_v1(meta).map(FileInfoV1ToV2)
}

export function FileInfoV1ToV2(info: FileInfoV1): FileInfo {
    return { ...info, type: 'file', provider: 'arweave' as Provider }
}

export async function makeFileKeySigned(fileKey: string | undefined | null) {
    if (isNil(fileKey)) {
        return null
    }
    const encodedKey = encodeText(fileKey)
    const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: { name: 'SHA-256' } }, true, ['sign', 'verify'])
    const exportedKey = await crypto.subtle.exportKey('raw', key)
    const signed = await crypto.subtle.sign({ name: 'HMAC' }, key, encodedKey)
    return [signed, exportedKey].map(encodeArrayBuffer)
}

export function getGatewayAPI(provider: Provider) {
    switch (provider) {
        case Provider.arweave:
            return 'https://arweave.net'
        case Provider.ipfs:
            return 'https://infura-ipfs.io/ipfs'
        case Provider.swarm:
            return 'https://bee-2.gateway.ethswarm.org/bzz'
        default:
            unreachable(provider)
    }
}
