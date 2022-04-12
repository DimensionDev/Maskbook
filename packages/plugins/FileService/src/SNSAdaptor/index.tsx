import { formatFileSize } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { truncate } from 'lodash-unified'
import { base } from '../base'
import { Trans } from 'react-i18next'
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
        {
            RenderEntryComponent({ disabled, AppIcon, title }) {
                return (
                    <ApplicationEntry
                        title={title}
                        disabled={disabled}
                        AppIcon={AppIcon}
                        onClick={() =>
                            CrossIsolationMessages.events.requestComposition.sendToLocal({
                                reason: 'timeline',
                                open: true,
                                options: {
                                    startupPlugin: base.ID,
                                },
                            })
                        }
                    />
                )
            },
            appBoardSortingDefaultPriority: 2,
            marketListSortingPriority: 2,
            AppIcon: <FileServiceIcon />,
            category: 'dapp',
            description: <Trans i18nKey="plugin_file_service_description" />,
            name: <Trans i18nKey="plugin_file_service_name" />,
            tutorialLink:
                'https://realmasknetwork.notion.site/Use-File-Service-via-Arweave-IPFS-SIA-Swarm-soon-8c8fe1efce5a48b49739a38f4ea8c60f',
        },
    ],
}

export default definition

function onAttachedFile(payload: FileInfo) {
    const name = truncate(payload.name, { length: 10 })
    return `Attached File: ${name} (${formatFileSize(payload.size)})`
}
