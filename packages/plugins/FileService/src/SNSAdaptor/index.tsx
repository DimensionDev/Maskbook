import { formatFileSize } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { truncate } from 'lodash-unified'
import { base } from '../base'
import { META_KEY_1, META_KEY_2 } from '../constants'
import { FileInfoMetadataReader } from '../helpers'
import type { FileInfo } from '../types'
import FileServiceDialog from './MainDialog'
import { Preview } from './Preview'
import { FileServiceIcon } from '@masknet/icons'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { ApplicationEntry } from '@masknet/shared'

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
        label: (
            <>
                <FileServiceIcon style={{ width: 16, height: 16 }} />
                File Service
            </>
        ),
        dialog: FileServiceDialog,
    },
    ApplicationEntries: [
        (() => {
            const icon = <FileServiceIcon />
            const name = { fallback: 'File Service' }
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <ApplicationEntry
                            title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                            {...EntryComponentProps}
                            icon={icon}
                            onClick={
                                EntryComponentProps.onClick ??
                                (() =>
                                    CrossIsolationMessages.events.requestComposition.sendToLocal({
                                        reason: 'timeline',
                                        open: true,
                                        options: {
                                            startupPlugin: base.ID,
                                        },
                                    }))
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 2,
                marketListSortingPriority: 2,
                icon,
                category: 'dapp',
                description: {
                    i18nKey: '__plugin_description',
                    fallback:
                        'Decentralized file storage, permanently. Upload and share files to your Mask friends on top of Arweave Network.',
                },
                name,
                tutorialLink: 'https://realmasknetwork.notion.site/8c8fe1efce5a48b49739a38f4ea8c60f',
            }
        })(),
    ],
}

export default definition

function onAttachedFile(payload: FileInfo) {
    const name = truncate(payload.name, { length: 10 })
    return `Attached File: ${name} (${formatFileSize(payload.size)})`
}
