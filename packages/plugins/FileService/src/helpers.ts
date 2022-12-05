import type { TypedMessage } from '@masknet/typed-message'
import { createTypedMessageMetadataReader } from '@masknet/typed-message-react'
import { META_KEY_1, META_KEY_2, META_KEY_3 } from './constants.js'
import { FileInfo, FileInfoV1, Provider } from './types.js'
import schemaV1 from './schema-v1.json'
import schemaV2 from './schema-v2.json'
import schemaV3 from './schema-v3.json'
import type { Result } from 'ts-results-es'
import { isNil } from 'lodash-es'
import { encodeArrayBuffer, encodeText } from '@masknet/kit'
import { createLookupTableResolver } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { openWindow } from '@masknet/shared-base-ui'

// Note: if the latest version has been changed, please update packages/mask/src/components/CompositionDialog/useSubmit.ts
const reader_v1 = createTypedMessageMetadataReader<FileInfoV1>(META_KEY_1, schemaV1)
const reader_v2 = createTypedMessageMetadataReader<FileInfo>(META_KEY_2, schemaV2)
const reader_v3 = createTypedMessageMetadataReader<FileInfo[]>(META_KEY_3, schemaV3)

export function FileInfoMetadataReader(meta: TypedMessage['meta']): Result<FileInfo[], void> {
    const v3 = reader_v3(meta)
    if (v3.ok) return v3
    const v2 = reader_v2(meta).map((info) => [info])
    if (v2.ok) return v2
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

export const resolveGatewayAPI = createLookupTableResolver<Provider, string>(
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
    const link = urlcat(gateway, '/:txId', { txId: file.landingTxID })
    openWindow(file.key ? `${link}#${file.key}` : link)
}
