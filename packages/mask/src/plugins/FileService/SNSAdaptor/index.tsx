import { formatFileSize } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { truncate } from 'lodash-unified'
import { ToolIconURLs } from '../../../resources/tool-icon'
import { base } from '../base'
import { META_KEY_1, META_KEY_2 } from '../constants'
import { FileInfoMetadataReader } from '../helpers'
import type { FileInfo } from '../types'
import FileServiceDialog from './MainDialog'
import { Preview } from './Preview'

const definition: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const metadata = FileInfoMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <Preview info={metadata.val} />
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [META_KEY_1, onAttachedFile],
        [META_KEY_2, onAttachedFile],
    ]),
    CompositionDialogEntry: {
        label: '📃 File Service',
        dialog: FileServiceDialog,
    },
    ToolbarEntry: {
        ...ToolIconURLs.files,
        onClick: 'openCompositionEntry',
    },
}

export default definition

function onAttachedFile(payload: FileInfo) {
    const name = truncate(payload.name, { length: 10 })
    return `Attached File: ${name} (${formatFileSize(payload.size)})`
}
