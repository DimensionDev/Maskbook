import urlcat from 'urlcat'
import { isNil } from 'lodash-es'
import type { Result } from 'ts-results-es'
import { isAfter } from 'date-fns'
import { encodeArrayBuffer, encodeText } from '@masknet/kit'
import { createLookupTableResolver } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import type { TypedMessage } from '@masknet/typed-message'
import { createTypedMessageMetadataReader } from '@masknet/typed-message-react'
import { META_KEY_1, META_KEY_2, META_KEY_3, RECOVERY_PAGE } from './constants.js'
import { type FileInfo, type FileInfoV1, Provider } from './types.js'
import schemaV1 from './schema-v1.json' with { type: 'json' }
import schemaV2 from './schema-v2.json' with { type: 'json' }
import schemaV3 from './schema-v3.json' with { type: 'json' }

// Note: if the latest version has been changed, please update packages/mask/content-script/components/CompositionDialog/useSubmit.ts
const reader_v1 = createTypedMessageMetadataReader<FileInfoV1>(META_KEY_1, schemaV1)
const reader_v2 = createTypedMessageMetadataReader<FileInfo>(META_KEY_2, schemaV2)
const reader_v3 = createTypedMessageMetadataReader<FileInfo[]>(META_KEY_3, schemaV3)

export function getFileInfoMetadata(meta: TypedMessage['meta']): Result<FileInfo[], void> {
    const v3 = reader_v3(meta)
    if (v3.isOk()) return v3
    const v2 = reader_v2(meta).map((info) => [info])
    if (v2.isOk()) return v2
    return reader_v1(meta).map(migrateFileInfoV1)
}

export function migrateFileInfoV1(info: FileInfoV1): FileInfo[] {
    return [{ ...info, type: 'file', provider: 'arweave' as Provider }]
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

const resolveGatewayAPI = createLookupTableResolver<Provider, string>(
    {
        [Provider.Arweave]: 'https://arweave.net',
        [Provider.IPFS]: 'https://mask.infura-ipfs.io/ipfs',
    },
    () => 'Unknown provider',
)

export function makeFileKey(length = 16) {
    let key = ''
    // cspell:disable-next-line
    const table = 'ABDEFGHJKMNPQRTWXYadefhijkmnprstuvwxyz03478'
    for (let i = 0; i < length; i += 1) {
        key += table.charAt(Math.floor(Math.random() * table.length))
    }
    return key
}

export function downloadFile(file: FileInfo) {
    const gateway = resolveGatewayAPI(file.provider)
    let link = urlcat(gateway, '/:txId', { txId: file.landingTxID })
    if (isAfter(new Date(2022, 8, 1), new Date(file.createdAt))) {
        link = urlcat(RECOVERY_PAGE, {
            url: encodeURIComponent(link),
        })
    }
    openWindow(file.key ? `${link}#${file.key}` : link)
}

async function digestFile(file: File) {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0'))
    return hashHex
}

async function digestMessage(message: string) {
    const buffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    return hashHex
}

export async function digest(file: File, extraData: Array<number | string | boolean | null>) {
    const fileDigest = await digestFile(file)
    const dataDigest = await digestMessage(JSON.stringify(extraData))
    return digestMessage(JSON.stringify([fileDigest, dataDigest]))
}
