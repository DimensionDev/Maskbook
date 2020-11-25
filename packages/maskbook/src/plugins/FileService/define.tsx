import { formatFileSize } from '@dimensiondev/kit'
import { truncate } from 'lodash-es'
import { createTypedMessageMetadataReader } from '../../protocols/typed-message/metadata'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { identifier, META_KEY_1, pluginName } from './constants'
import { Preview } from './Preview'
import type { FileInfo } from './types'
import schema from './schema.json'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import FileServiceDialog from './MainDialog'
import * as i18n from './locales'

export const FileInfoMetadataReader = createTypedMessageMetadataReader<FileInfo>(META_KEY_1, schema)
const [FileServiceCompositionEntry, FileServiceCompositionUI] = createCompositionDialog('📃 File Service', (props) => (
    <FileServiceDialog open={props.open} onConfirm={props.onClose} onDecline={props.onClose} />
))
export const FileServicePluginDefine: PluginConfig = {
    pluginName,
    identifier,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    i18n: (onUpdate) => {
        if (module.hot) module.hot.accept(['./locales/'], () => onUpdate(i18n))
        return i18n
    },
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
