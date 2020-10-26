import { formatFileSize } from '@dimensiondev/kit'
import { truncate } from 'lodash-es'
import React from 'react'
import { createTypedMessageMetadataReader } from '../../protocols/typed-message/metadata'
import type { PluginConfig } from '../plugin'
import { identifier, META_KEY_1, pluginName } from './constants'
import { Preview } from './Preview'
import type { FileInfo } from './types'
import schema from './schema.json'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import FileServiceEntryIcon from '../../components/InjectedComponents/FileServiceEntryIcon'
import FileServiceDialog from './MainDialog'

export const FileInfoMetadataReader = createTypedMessageMetadataReader<FileInfo>(META_KEY_1, schema)
const [FileServiceCompositionEntry, FileServiceCompositionUI] = createCompositionDialog(
    <>
        <FileServiceEntryIcon width={16} height={16} />
        &nbsp;File Service
    </>,
    (props) => (
        <FileServiceDialog
            // classes={classes}
            // DialogProps={props.DialogProps}
            open={props.open}
            onConfirm={props.onClose}
            onDecline={props.onClose}
        />
    ),
)
export const FileServicePluginDefine: PluginConfig = {
    pluginName,
    identifier,
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
    pageInspector: FileServiceCompositionUI,
    postDialogEntries: [FileServiceCompositionEntry],
}
