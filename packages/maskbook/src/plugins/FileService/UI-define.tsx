import { formatFileSize } from '@dimensiondev/kit'
import { truncate } from 'lodash-es'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { identifier, META_KEY_1, pluginName } from './constants'
import { Preview } from './Preview'
import type { FileInfo } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import FileServiceDialog from './MainDialog'
import { FileInfoMetadataReader } from './define'

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
