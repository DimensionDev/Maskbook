import { formatFileSize } from '@dimensiondev/kit'
import { truncate } from 'lodash-es'
import { createTypedMessageMetadataReader } from '../../protocols/typed-message/metadata'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { identifier, META_KEY_1, META_KEY_2, pluginName } from './constants'
import { Preview } from './Preview'
import type { FileInfo, FileInfoV1 } from './types'
import schema from './schema-v1.json'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import FileServiceDialog from './MainDialog'
import type { Result } from 'ts-results'
import type { TypedMessage } from '../../protocols/typed-message'

const reader_v1 = createTypedMessageMetadataReader<FileInfoV1>(META_KEY_1, schema)
const reader_v2 = createTypedMessageMetadataReader<FileInfo>(META_KEY_2, schema)
export function FileInfoMetadataReader(meta: TypedMessage['meta']): Result<FileInfo, void> {
    const v2 = reader_v2(meta)
    if (v2.ok) return v2
    return reader_v1(meta).map(FileInfoV1ToV2)
}
export function FileInfoV1ToV2(info: FileInfoV1): FileInfo {
    return { ...info, type: 'file', provider: 'arweave' }
}

const [FileServiceCompositionEntry, FileServiceCompositionUI] = createCompositionDialog('📃 File Service', (props) => (
    <FileServiceDialog
        // classes={classes}
        // DialogProps={props.DialogProps}
        open={props.open}
        onConfirm={props.onClose}
        onDecline={props.onClose}
    />
))
export const FileServicePluginDefine: PluginConfig = {
    pluginName,
    identifier,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector(props) {
        const metadata = FileInfoMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <Preview info={metadata.val} />
    },
    postDialogMetadataBadge: new Map([
        [
            META_KEY_1,
            (payload: FileInfo) => {
                const name = truncate(payload.name, { length: 10 })
                return `Attached File: ${name} (${formatFileSize(payload.size)})`
            },
        ],
    ]),
    PageComponent: FileServiceCompositionUI,
    postDialogEntries: [FileServiceCompositionEntry],
}
