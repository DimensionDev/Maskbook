import { formatFileSize } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { truncate } from 'lodash-unified'
import { base } from '../base'
import { META_KEY_1, META_KEY_2 } from '../constants'
import { FileInfoMetadataReader } from '../helpers'
import type { FileInfo } from '../types'
import FileServiceDialog from './MainDialog'
import { Preview } from './Preview'
import { FileServiceIcon } from '@masknet/icons'
import { ApplicationEntry } from '@masknet/shared'
import { requestComposition } from '@masknet/shared-base'

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
        label: {
            fallback: (
                <>
                    <FileServiceIcon style={{ width: 16, height: 16 }} />
                    File Service
                </>
            ),
        },
        dialog: FileServiceDialog,
    },
    ApplicationEntries: [
        {
            RenderEntryComponent(key) {
                return (
                    <div key={key}>
                        <ApplicationEntry
                            title="File Service"
                            icon={new URL('./files.png', import.meta.url).toString()}
                            onClick={() => requestComposition(base.ID)}
                        />
                    </div>
                )
            },
            defaultSortingPriority: 2,
        },
    ],
}

export default definition

function onAttachedFile(payload: FileInfo) {
    const name = truncate(payload.name, { length: 10 })
    return `Attached File: ${name} (${formatFileSize(payload.size)})`
}
