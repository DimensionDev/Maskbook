import { createTypedMessageMetadataReader } from '../../protocols/typed-message/metadata'
import { META_KEY_1, META_KEY_2 } from './constants'
import type { FileInfo, FileInfoV1 } from './types'
import schemaV1 from './schema-v1.json'
import schemaV2 from './schema-v2.json'
import type { Result } from 'ts-results'
import type { TypedMessage } from '../../protocols/typed-message'

const reader_v1 = createTypedMessageMetadataReader<FileInfoV1>(META_KEY_1, schemaV1)
const reader_v2 = createTypedMessageMetadataReader<FileInfo>(META_KEY_2, schemaV2)
export function FileInfoMetadataReader(meta: TypedMessage['meta']): Result<FileInfo, void> {
    const v2 = reader_v2(meta)
    if (v2.ok) return v2
    return reader_v1(meta).map(FileInfoV1ToV2)
}
export function FileInfoV1ToV2(info: FileInfoV1): FileInfo {
    return { ...info, type: 'file', provider: 'arweave' }
}
