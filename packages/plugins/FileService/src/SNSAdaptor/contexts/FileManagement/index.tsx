import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { WalletMessages } from '@masknet/plugin-wallet'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { noop, omit } from 'lodash-es'
import {
    createContext,
    type Dispatch,
    type FC,
    memo,
    type PropsWithChildren,
    type SetStateAction,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncRetry } from 'react-use'
import { META_KEY_3, RoutePaths } from '../../../constants.js'
import { digest, makeFileKey } from '../../../helpers.js'
import type { FileInfo, Provider } from '../../../types.js'
import { PluginFileServiceRPC, PluginFileServiceRPCGenerator } from '../../../Worker/rpc.js'

interface UploadState {
    progress: number
}
type UploadStateMap = Record<string, UploadState>
export interface FileManagementContextOptions {
    files: FileInfo[]
    recentFiles: FileInfo[]
    refetchFiles: () => void
    uploadingFiles: FileInfo[]
    uploadStateMap: UploadStateMap
    setUploadProgress: (id: string, progress: number) => void
    setUploadingFiles: Dispatch<SetStateAction<FileInfo[]>>
    uploadFile: (file: File, provider: Provider, useCDN: boolean, encrypted: boolean) => Promise<FileInfo>
    attachToPost: (info: FileInfo | FileInfo[]) => void
}

export const FileManagementContext = createContext<FileManagementContextOptions>({
    files: [],
    recentFiles: [],
    refetchFiles: noop,
    uploadingFiles: [],
    uploadStateMap: {},
    setUploadProgress: noop,
    setUploadingFiles: noop,
    uploadFile: null!,
    attachToPost: noop,
})

function openCompositionWithFiles(type: CompositionType, files: FileInfo[]) {
    CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
        reason: type,
        open: true,
        options: {
            initialMetas: {
                [META_KEY_3]: files,
            },
        },
    })
}

interface Props extends PropsWithChildren<{}> {
    // The file management could be opened via different ways
    compositionType: CompositionType
}

export const FileManagementProvider: FC<Props> = memo(({ children, compositionType }) => {
    const { value: files = EMPTY_LIST, retry: refetchFiles } = useAsyncRetry(
        () => PluginFileServiceRPC.getAllFiles(),
        [],
    )

    const navigate = useNavigate()
    const [uploadingFiles, setUploadingFiles] = useState<FileInfo[]>([])
    const [uploadStateMap, setUploadStateMap] = useState<UploadStateMap>({})
    const setUploadProgress = useCallback((id: string, progress: number) => {
        setUploadStateMap((map) => {
            return {
                ...map,
                [id]: { ...map[id], progress },
            }
        })
    }, [])

    const uploadFile = useCallback(
        async (file: File, provider: Provider, useCDN: boolean, encrypted: boolean) => {
            const key = encrypted ? makeFileKey() : undefined
            const buffer = new Uint8Array(await file.arrayBuffer())
            const id = await digest(file, [provider, useCDN, encrypted])
            const createdAt = Date.now()

            const removeUnloadingFile = (id: string) => {
                setUploadingFiles((files) => files.filter((x) => x.id !== id))
                setUploadStateMap((map) => omit(map, [id]))
            }

            setUploadingFiles((files) => [
                ...files,
                {
                    type: 'file',
                    key,
                    provider,
                    id,
                    name: file.name,
                    size: file.size,
                    createdAt,
                },
            ])
            setUploadProgress(id, 0)

            const payloadTxID = await PluginFileServiceRPC.makeAttachment(provider, {
                key,
                name: file.name,
                type: file.type,
                block: buffer,
            })
            // Uploading
            for await (const progress of PluginFileServiceRPCGenerator.upload(provider, payloadTxID)) {
                setUploadProgress(id, progress)
            }

            const landingTxID = await PluginFileServiceRPC.uploadLandingPage(provider, {
                name: file.name,
                size: file.size,
                txId: payloadTxID,
                type: file.type,
                key,
                useCDN,
            })

            const fileInfo: FileInfo = {
                type: 'file',
                provider,
                id,
                name: file.name,
                size: file.size,
                createdAt,
                key,
                payloadTxID,
                landingTxID,
            }
            await PluginFileServiceRPC.setFileInfo(fileInfo)
            removeUnloadingFile(id)
            refetchFiles()
            return fileInfo
        },
        [refetchFiles],
    )

    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.applicationDialogUpdated,
    )
    const attachToPost = useCallback(
        (fileInfo: FileInfo | FileInfo[]) => {
            openCompositionWithFiles(compositionType, Array.isArray(fileInfo) ? fileInfo : [fileInfo])
            closeApplicationBoardDialog()
            navigate(RoutePaths.Exit)
        },
        [compositionType, closeApplicationBoardDialog, navigate],
    )

    const contextValue: FileManagementContextOptions = useMemo(() => {
        return {
            files,
            recentFiles: files.slice(0, 4),
            refetchFiles,
            uploadingFiles,
            uploadStateMap,
            uploadFile,
            setUploadProgress,
            setUploadingFiles,
            attachToPost,
        }
    }, [files, uploadStateMap, uploadingFiles, attachToPost, refetchFiles])

    return <FileManagementContext.Provider value={contextValue}>{children}</FileManagementContext.Provider>
})

FileManagementProvider.displayName = 'FileManagementProvider'

export function useFileManagement() {
    return useContext(FileManagementContext)
}
