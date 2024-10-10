import { noop, omit } from 'lodash-es'
import {
    createContext,
    type Dispatch,
    memo,
    type PropsWithChildren,
    type SetStateAction,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'
import { useAsyncRetry } from 'react-use'
import { useNavigate } from 'react-router-dom'
import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { ApplicationBoardModal } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { META_KEY_3, RoutePaths } from '../../../constants.js'
import { digest, makeFileKey } from '../../../helpers.js'
import type { FileInfo, Provider } from '../../../types.js'
import { PluginFileServiceRPC, PluginFileServiceRPCGenerator } from '../../rpc.js'

interface UploadState {
    progress: number
}
type UploadStateMap = Record<string, UploadState>
interface FileManagementContextOptions {
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

const FileManagementContext = createContext<FileManagementContextOptions>({
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
            initialMeta: {
                [META_KEY_3]: files,
            },
        },
    })
}

interface Props extends PropsWithChildren {
    // The file management could be opened via different ways
    compositionType: CompositionType
}

export const FileManagementProvider = memo(({ children, compositionType }: Props) => {
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

    const attachToPost = useCallback(
        (fileInfo: FileInfo | FileInfo[]) => {
            openCompositionWithFiles(compositionType, Array.isArray(fileInfo) ? fileInfo : [fileInfo])
            ApplicationBoardModal.close()
            navigate(RoutePaths.Exit)
        },
        [compositionType, navigate],
    )

    const recentFiles = useMemo(() => files.slice(0, 4), [files])
    const contextValue: FileManagementContextOptions = useMemo(() => {
        return {
            files,
            recentFiles,
            refetchFiles,
            uploadingFiles,
            uploadStateMap,
            uploadFile,
            setUploadProgress,
            setUploadingFiles,
            attachToPost,
        }
    }, [files, recentFiles, uploadStateMap, uploadingFiles, attachToPost, refetchFiles, uploadFile])

    return <FileManagementContext value={contextValue}>{children}</FileManagementContext>
})

FileManagementProvider.displayName = 'FileManagementProvider'

export function useFileManagement() {
    return useContext(FileManagementContext)
}
