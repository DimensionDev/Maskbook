import { List, ListItem, Typography } from '@mui/material'
import { makeStyles, Boundary, useCustomSnackbar } from '@masknet/theme'
import type { FileInfo } from '../../types.js'
import { FC, HTMLProps, useCallback, useRef } from 'react'
import {
    DisplayingFile,
    DisplayingFileProps,
    ManageableFile,
    ManageableFileProps,
    SelectableFile,
    UploadingFile,
} from './Files/index.js'
import { Translate, useI18N } from '../../locales/index.js'
import { useFileManagement, useShowConfirm, useShowRenameDialog } from '../contexts/index.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { PluginFileServiceRPC } from '../../Worker/rpc.js'

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
        padding: 0,
    },
    listItem: {
        width: 'auto',
        padding: 0,
        margin: theme.spacing(0, 2, 1.5),
    },
    file: {
        width: '100%',
    },
}))

interface FileListBaseProps extends HTMLProps<HTMLDivElement> {
    files: FileInfo[]
    onLoadMore?(): void
}
interface FileListProps extends FileListBaseProps, Pick<ManageableFileProps, 'onDownload' | 'onSend'> {
    onLoadMore?(): void
}

export const FileList: FC<FileListProps> = ({ files, onLoadMore, className, onDownload, onSend, ...rest }) => {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const { uploadStateMap, refetchFiles } = useFileManagement()

    const { showSnackbar } = useCustomSnackbar()
    const showConfirm = useShowConfirm()
    const handleDelete = useCallback(
        async (file: FileInfo) => {
            const confirmed = await showConfirm({
                title: t.delete_file(),
                message: (
                    <Translate.delete_message
                        values={{
                            name: file.name,
                        }}
                        components={{
                            file: <Typography color={(theme) => theme.palette.maskColor.main} fontWeight={700} />,
                        }}
                    />
                ),
                description: t.delete_description(),
                confirmLabel: t.delete(),
            })
            if (confirmed) {
                try {
                    await PluginFileServiceRPC.deleteFile(file.id)
                    refetchFiles()
                    showSnackbar(t.delete_file_title({ context: 'success' }), {
                        variant: 'success',
                        message: t.delete_file_message({ context: 'success', name: file.name }),
                    })
                } catch (err) {
                    showSnackbar(t.delete_file_title({ context: 'failed' }), {
                        variant: 'error',
                        message: t.delete_file_message({ context: 'failed', name: file.name }),
                    })
                }
            }
        },
        [showConfirm, refetchFiles, t],
    )
    const showPrompt = useShowRenameDialog()
    const handleRename = useCallback(
        async (file: FileInfo) => {
            const newName = await showPrompt({
                currentName: file.name,
                message: t.rename_validation(),
            })
            if (newName) {
                await PluginFileServiceRPC.renameFile(file.id, newName)
                refetchFiles()
            }
        },
        [showPrompt, refetchFiles, t],
    )

    const boundaryRef = useRef<HTMLUListElement>(null)

    return (
        <section className={cx(classes.container, className)} {...rest}>
            <Boundary boundaryRef={boundaryRef}>
                <List className={classes.list} classes={{ root: classes.listRoot }} ref={boundaryRef}>
                    {files.map((file) => (
                        <ListItem key={file.id} className={classes.listItem} classes={{ root: classes.itemRoot }}>
                            {uploadStateMap[file.id] ? (
                                <UploadingFile
                                    className={classes.file}
                                    file={file}
                                    progress={uploadStateMap[file.id]?.progress ?? 0}
                                />
                            ) : (
                                <ManageableFile
                                    className={classes.file}
                                    file={file}
                                    onDelete={handleDelete}
                                    onRename={handleRename}
                                    onDownload={onDownload}
                                    onSend={onSend}
                                />
                            )}
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

const FILE_LIMIT = 3
export const SelectableFileList: FC<SelectableFileListProps> = ({
    files,
    className,
    selectedIds = EMPTY_LIST,
    onChange,
    ...rest
}) => {
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

    const boundaryRef = useRef<HTMLUListElement>(null)

    return (
        <section className={cx(classes.container, className)} {...rest}>
            <Boundary boundaryRef={boundaryRef}>
                <List className={classes.list} classes={{ root: classes.listRoot }}>
                    {files.map((file) => (
                        <ListItem
                            key={file.id}
                            className={classes.listItem}
                            classes={{ root: classes.itemRoot }}
                            data-id={file.id}>
                            <SelectableFile
                                disabled={selectedIds.length >= FILE_LIMIT && !selectedIds.includes(file.id)}
                                className={classes.file}
                                file={file}
                                selected={selectedIds.includes(file.id)}
                                onChange={handleChange}
                            />
                        </ListItem>
                    ))}
                </List>
            </Boundary>
        </section>
    )
}
interface DisplayingFileFileListProps extends FileListBaseProps, Pick<DisplayingFileProps, 'onSave' | 'onDownload'> {}

export const DisplayingFileList: FC<DisplayingFileFileListProps> = ({
    files,
    className,
    onSave,
    onDownload,
    ...rest
}) => {
    const { classes, cx } = useStyles()

    const boundaryRef = useRef<HTMLUListElement>(null)

    return (
        <section className={cx(classes.container, className)} {...rest}>
            <Boundary boundaryRef={boundaryRef}>
                <List className={classes.list} classes={{ root: classes.listRoot }}>
                    {files.map((file) => (
                        <ListItem key={file.id} className={classes.listItem} classes={{ root: classes.itemRoot }}>
                            <DisplayingFile
                                className={classes.file}
                                file={file}
                                onSave={onSave}
                                onDownload={onDownload}
                            />
                        </ListItem>
                    ))}
                </List>
            </Boundary>
        </section>
    )
}
