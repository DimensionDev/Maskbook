import { formatFileSize } from '@dimensiondev/kit'
import { truncate } from 'lodash-es'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { identifier, META_KEY_1, META_KEY_2, pluginIcon, pluginName, pluginDescription } from './constants'
import { FileInfoMetadataReader } from './define'
import FileServiceDialog from './MainDialog'
import { Preview } from './Preview'
import type { FileInfo } from './types'

export const [FileServiceCompositionEntry, FileServiceCompositionUI] = createCompositionDialog(
    '📃 File Service',
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
    ID: identifier,
    pluginIcon,
    pluginName,
    pluginDescription,
    identifier,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector(props) {
        const metadata = FileInfoMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <Preview info={metadata.val} />
    },
    postDialogMetadataBadge: new Map([
        [META_KEY_1, onAttachedFile],
        [META_KEY_2, onAttachedFile],
    ]),
    PageComponent: FileServiceCompositionUI,
    postDialogEntries: [FileServiceCompositionEntry],
}

function onAttachedFile(payload: FileInfo) {
    const name = truncate(payload.name, { length: 10 })
    return `Attached File: ${name} (${formatFileSize(payload.size)})`
}
