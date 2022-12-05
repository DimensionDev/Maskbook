import { Icons } from '@masknet/icons'
import { formatFileSize } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { truncate } from 'lodash-es'
import { base } from '../base.js'
import { META_KEY_1, META_KEY_2, META_KEY_3 } from '../constants.js'
import { FileInfoMetadataReader } from '../helpers.js'
import type { FileInfo } from '../types.js'
import { MultipleFileChip, SingleFileChip } from './components/index.js'
import { FileViewer } from './FileViewer.js'
import FileServiceDialog, { FileServiceDialogProps } from './MainDialog.js'
import { setupStorage, StorageOptions } from './storage.js'

type BadgeRenderer<T> = (f: T) => Plugin.SNSAdaptor.BadgeDescriptor

const definition: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage<StorageOptions>('persistent', { termsConfirmed: undefined }))
    },
    DecryptedInspector(props) {
        const metadata = FileInfoMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <FileViewer files={metadata.val} />
    },
    CompositionDialogMetadataBadgeRender: new Map<string, BadgeRenderer<FileInfo> | BadgeRenderer<FileInfo[]>>([
        [META_KEY_1, onAttachedFile],
        [META_KEY_2, onAttachedFile],
        [META_KEY_3, onAttachedMultipleFile],
    ]),
    CompositionDialogEntry: {
        label: (
            <>
                <Icons.FileService size={16} />
                File Service
            </>
        ),
        dialog: FileServiceDialog,
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.FileService size={36} />
            const name = { i18nKey: '__plugin_name', fallback: 'File Service' }
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const clickHandler = () =>
                        CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
                            reason: 'timeline',
                            open: true,
                            options: {
                                startupPlugin: base.ID,
                                isOpenFromApplicationBoard: true,
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
        icon: <Icons.FileService size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(247, 147, 30, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(255, 177, 16, 0.2) 100%), #FFFFFF;',
    },
}

export default definition

function openDialog(props: Partial<FileServiceDialogProps>) {
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason: 'timeline',
        open: true,
        options: {
            startupPlugin: base.ID,
            startupPluginProps: props,
            isOpenFromApplicationBoard: false,
        },
    })
}

function onAttachedFile(file: FileInfo): Plugin.SNSAdaptor.BadgeDescriptor {
    const name = truncate(file.name, { length: 10 })
    const size = formatFileSize(file.size)

    return {
        text: (
            <SingleFileChip
                name={name}
                size={size}
                onClick={() => {
                    openDialog({
                        selectedFileIds: [file.id],
                    })
                }}
            />
        ),
        tooltip: `${file.name} (${size})`,
    }
}

function onAttachedMultipleFile(files: FileInfo[]): Plugin.SNSAdaptor.BadgeDescriptor {
    if (files.length === 1) return onAttachedFile(files[0])
    return {
        text: (
            <MultipleFileChip
                count={files.length}
                role="button"
                onClick={() => {
                    openDialog({
                        selectedFileIds: files.map((file) => file.id),
                    })
                }}
            />
        ),
    }
}
