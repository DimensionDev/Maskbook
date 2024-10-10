import { truncate } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import { formatFileSize } from '@masknet/kit'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { MaskLightTheme } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import { base } from '../base.js'
import { META_KEY_1, META_KEY_2, META_KEY_3 } from '../constants.js'
import { getFileInfoMetadata } from '../helpers.js'
import type { FileInfo } from '../types.js'
import { MultipleFileChip, SingleFileChip } from './components/index.js'
import { FileViewer } from './FileViewer.js'
import { setupStorage, type StorageOptions } from './storage.js'
import { openBrowser, openPicker } from './emitter.js'
import { FileServiceInjection } from './FileServiceInjection.js'
import { Modals } from './modals/index.js'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Trans } from '@lingui/macro'

type BadgeRenderer<T> = (f: T) => Plugin.SiteAdaptor.BadgeDescriptor

function clickHandler() {
    return openBrowser('popup')
}
const definition: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage<StorageOptions>('persistent', { termsConfirmed: undefined }))
    },
    DecryptedInspector(props) {
        const metadata = getFileInfoMetadata(props.message.meta)

        if (!metadata.isOk()) return null
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <FileViewer files={metadata.value} />
            </ThemeProvider>
        )
    },
    CompositionDialogMetadataBadgeRender: new Map<string, BadgeRenderer<FileInfo> | BadgeRenderer<FileInfo[]>>([
        [META_KEY_1, onAttachedFile],
        [META_KEY_2, onAttachedFile],
        [META_KEY_3, onAttachedMultipleFile],
    ]),
    GlobalInjection() {
        return (
            <>
                <Modals />
                <FileServiceInjection />
            </>
        )
    },
    CompositionDialogEntry: {
        label: (
            <>
                <Icons.FileService size={16} />
                <Trans>File Service</Trans>
            </>
        ),
        onClick: ({ compositionType, metadata }) => {
            const payload = metadata?.get(META_KEY_3) as FileInfo[] | undefined
            const selectedIds = Array.isArray(payload) ? payload.map((f) => f.id) : EMPTY_LIST
            openPicker(selectedIds, compositionType)
        },
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.FileService size={36} />
            const name = <Trans>Web3 File Service</Trans>
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <ApplicationEntry
                            title={<PluginTransFieldRender field={name} pluginID={base.ID} />}
                            {...EntryComponentProps}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            onClick={() => {
                                EntryComponentProps.onClick ?
                                    EntryComponentProps.onClick?.(clickHandler)
                                :   clickHandler()
                                Telemetry.captureEvent(EventType.Access, EventID.EntryAppFileOpen)
                            }}
                        />
                    )
                },
                appBoardSortingDefaultPriority: 3,
                marketListSortingPriority: 3,
                icon,
                category: 'dapp',
                description: (
                    <Trans>
                        Decentralized file storage, permanently. Upload and share files to your Mask friends on top of
                        Arweave Network.
                    </Trans>
                ),
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

function onAttachedFile(file: FileInfo): Plugin.SiteAdaptor.BadgeDescriptor {
    const name = truncate(file.name, { length: 10 })
    const size = formatFileSize(file.size, true)

    return {
        text: (
            <SingleFileChip
                name={name}
                size={size}
                onClick={({ compositionType }) => {
                    openPicker([file.id], compositionType)
                }}
            />
        ),
        tooltip: `${file.name} (${size})`,
    }
}

function onAttachedMultipleFile(files: FileInfo[]): Plugin.SiteAdaptor.BadgeDescriptor {
    if (files.length === 1) return onAttachedFile(files[0])
    return {
        text: (
            <MultipleFileChip
                count={files.length}
                role="button"
                onClick={({ compositionType }) => {
                    openPicker(
                        files.map((file) => file.id),
                        compositionType,
                    )
                }}
            />
        ),
    }
}
