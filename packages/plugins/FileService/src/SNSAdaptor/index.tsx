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
            const name = { i18nKey: '__plugin_name', fallback: 'File Service' }
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const clickHandler = () =>
                        CrossIsolationMessages.events.requestComposition.sendToLocal({
                            reason: 'timeline',
                            open: true,
                            options: {
                                startupPlugin: base.ID,
                            },
                        })

                    return (
                        <ApplicationEntry
                            title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                            {...EntryComponentProps}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            onClick={
                                EntryComponentProps.onClick
                                    ? () => EntryComponentProps.onClick?.(clickHandler)
                                    : clickHandler
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
                iconFilterColor,
                tutorialLink: 'https://realmasknetwork.notion.site/8c8fe1efce5a48b49739a38f4ea8c60f',
            }
        })(),
    ],
    wrapperProps: {
        icon: (
            <FileServiceIcon
                style={{ width: 24, height: 24, filter: 'drop-shadow(0px 6px 12px rgba(247, 147, 30, 0.2))' }}
            />
        ),
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(255, 177, 16, 0.2) 100%), #FFFFFF;',
    },
}

export default definition

function onAttachedFile(payload: FileInfo) {
    const name = truncate(payload.name, { length: 10 })
    return {
        text: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <FileServiceIcon style={{ width: 16, height: 16 }} />
                Attached File: {name} ({formatFileSize(payload.size)})
            </div>
        ),
    }
}
