import { type HTMLProps, useCallback, useRef } from 'react'
import { List, ListItem, Typography } from '@mui/material'
import { EMPTY_LIST } from '@masknet/shared-base'

import { makeStyles, Boundary, useCustomSnackbar } from '@masknet/theme'
import type { FileInfo } from '../../types.js'
import {
    DisplayingFile,
    type DisplayingFileProps,
    ManageableFile,
    type ManageableFileProps,
    SelectableFile,
    UploadingFile,
} from './Files/index.js'
import { useFileManagement } from '../contexts/index.js'
import { PluginFileServiceRPC } from '../rpc.js'
import { ConfirmModal, RenameModal } from '../modals/modals.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    container: {
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
    },
    list: {
        flexGrow: 1,
        overflow: 'auto',
        paddingTop: theme.spacing(1),
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    listRoot: {
        padding: theme.spacing(0, 0, 1.5),
    },
    listItem: {
        width: 'auto',
        padding: 0,
        margin: theme.spacing(0, 2),
    },
    disabled: {
        opacity: 0.5,
    },
    file: {
        width: '100%',
    },
}))

interface FileListBaseProps extends HTMLProps<HTMLElement> {
    files: FileInfo[]
    onLoadMore?(): void
}
interface FileListProps extends FileListBaseProps, Pick<ManageableFileProps, 'onDownload' | 'onSend'> {
    onLoadMore?(): void
}

export function FileList({ files, onLoadMore, className, onDownload, onSend, ...rest }: FileListProps) {
    const { _ } = useLingui()
    const { classes, cx } = useStyles()
    const { uploadStateMap, refetchFiles } = useFileManagement()

    const { showSnackbar } = useCustomSnackbar()

    const deleteFile = useCallback(
        async (file: FileInfo) => {
            try {
                await PluginFileServiceRPC.deleteFile(file.id)
                refetchFiles()
                showSnackbar(<Trans>File delete</Trans>, {
                    variant: 'success',
                    message: <Trans>File {file.name} deleted.</Trans>,
                })
            } catch (err) {
                showSnackbar(<Trans>File delete failed</Trans>, {
                    variant: 'error',
                    message: <Trans>Failed to delete, please try again.</Trans>,
                })
            }
        },
        [refetchFiles],
    )

    const handleDelete = useCallback(
        async (file: FileInfo) => {
            const confirmed = await ConfirmModal.openAndWaitForClose({
                title: _(msg`Delete File`),
                message: (
                    <Trans>
                        Do you want to delete file{' '}
                        <Typography color={(theme) => theme.palette.maskColor.main} fontSize={14} fontWeight={700}>
                            {file.name}
                        </Typography>
                    </Trans>
                ),
                description: (
                    <Trans>
                        Users can only delete local links of these files. Files on the decentralized storage protocols
                        cannot be deleted.
                    </Trans>
                ),
                confirmLabel: _(msg`Delete`),
            })
            if (confirmed) await deleteFile(file)
        },
        [refetchFiles],
    )

    const handleRename = useCallback(
        async (file: FileInfo) => {
            const name = await RenameModal.openAndWaitForClose({
                currentName: file.name,
                message: <Trans>File name must between 3 to 20 characters.</Trans>,
            })
            if (!name) return

            await PluginFileServiceRPC.renameFile(file.id, name)
            refetchFiles()
        },
        [refetchFiles],
    )

    return (
        <section className={cx(classes.container, className)} {...rest}>
            <Boundary>
                <List className={classes.list} classes={{ root: classes.listRoot }}>
                    {files.map((file) => (
                        <ListItem key={file.id} className={classes.listItem}>
                            {uploadStateMap[file.id] ?
                                <UploadingFile
                                    className={classes.file}
                                    file={file}
                                    progress={uploadStateMap[file.id]?.progress ?? 0}
                                />
                            :   <ManageableFile
                                    className={classes.file}
                                    file={file}
                                    onDelete={handleDelete}
                                    onRename={handleRename}
                                    onDownload={onDownload}
                                    onSend={onSend}
                                />
                            }
                        </ListItem>
                    ))}
                </List>
            </Boundary>
        </section>
    )
}

interface SelectableFileListProps extends Omit<FileListBaseProps, 'onChange' | 'selected'> {
    selectedIds?: string[]
    onChange?(selectedIds: string[]): void
}

const FILE_LIMIT = 2
export function SelectableFileList({
    files,
    className,
    selectedIds = EMPTY_LIST,
    onChange,
    ...rest
}: SelectableFileListProps) {
    const { classes, cx } = useStyles()

    const selectedIdsRef = useRef(selectedIds)
    const filesRef = useRef(files)
    const onChangeRef = useRef(onChange)

    selectedIdsRef.current = selectedIds
    filesRef.current = files
    onChangeRef.current = onChange

    const handleChange = useCallback((fileId: string, checked: boolean) => {
        const oldIds = selectedIdsRef.current
        const newIds = filesRef.current.map((x) => x.id).filter((id) => (id === fileId ? checked : oldIds.includes(id)))
        onChangeRef.current?.(newIds)
    }, [])

    return (
        <section className={cx(classes.container, className)} {...rest}>
            <Boundary>
                <List className={classes.list} classes={{ root: classes.listRoot }}>
                    {files.map((file) => {
                        const disabled = selectedIds.length >= FILE_LIMIT && !selectedIds.includes(file.id)
                        return (
                            <ListItem
                                key={file.id}
                                className={cx(classes.listItem, disabled ? classes.disabled : null)}>
                                <SelectableFile
                                    disabled={disabled}
                                    className={classes.file}
                                    file={file}
                                    selected={selectedIds.includes(file.id)}
                                    onChange={handleChange}
                                />
                            </ListItem>
                        )
                    })}
                </List>
            </Boundary>
        </section>
    )
}
interface DisplayingFileFileListProps extends FileListBaseProps, Pick<DisplayingFileProps, 'onSave' | 'onDownload'> {}

/**
 * Render in decrypted post
 */
export function DisplayingFileList({ files, className, onSave, onDownload, ...rest }: DisplayingFileFileListProps) {
    const { classes, cx } = useStyles()

    return (
        <section className={cx(classes.container, className)} {...rest}>
            <List className={classes.list} classes={{ root: classes.listRoot }}>
                {files.map((file) => (
                    <ListItem key={file.id} className={classes.listItem}>
                        <DisplayingFile className={classes.file} file={file} onSave={onSave} onDownload={onDownload} />
                    </ListItem>
                ))}
            </List>
        </section>
    )
}
