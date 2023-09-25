import { Icons } from '@masknet/icons'
import { formatFileSize } from '@masknet/kit'
import { FileFrame } from '@masknet/shared'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { MenuItem, Typography } from '@mui/material'
import { memo, useRef, useState } from 'react'
import { FileServiceTrans, useFileServiceI18N } from '../../../locales/index.js'
import type { FileBaseProps, FileInfo } from '../../../types.js'

const useStyles = makeStyles()((theme) => ({
    desc: {
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        fontSize: 12,
    },
    meta: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.third,
    },
    metaValue: {
        color: theme.palette.maskColor.second,
    },
    operations: {
        display: 'flex',
        alignItems: 'center',
    },
    operationButton: {
        marginLeft: theme.spacing(1),
        color: theme.palette.maskColor.main,
    },
    menuButton: {
        color: theme.palette.maskColor.second,
    },
    menuLabel: {
        fontWeight: 700,
        lineHeight: '18px',
    },
    menu: {
        minWidth: 229,
    },
}))

export interface ManageableFileProps extends FileBaseProps {
    file: FileInfo
    onDelete?(file: FileInfo): void
    onRename?(file: FileInfo): void
    onDownload?(file: FileInfo): void
    onSend?(file: FileInfo): void
}

export const ManageableFile = memo(({ file, onDownload, onRename, onDelete, onSend, ...rest }: ManageableFileProps) => {
    const { classes, cx } = useStyles()
    const menuRef = useRef<HTMLDivElement>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const t = useFileServiceI18N()

    return (
        <FileFrame
            fileName={file.name}
            {...rest}
            operations={
                <div className={classes.operations}>
                    <Icons.Send
                        className={classes.operationButton}
                        onClick={() => {
                            onSend?.(file)
                        }}
                        size={20}
                    />
                    <Icons.More
                        ref={menuRef}
                        className={cx(classes.operationButton, classes.menuButton)}
                        onClick={() => setMenuOpen(true)}
                        size={20}
                    />
                    <ShadowRootMenu
                        classes={{ paper: classes.menu }}
                        anchorEl={menuRef.current}
                        anchorOrigin={{
                            horizontal: 'right',
                            vertical: 'bottom',
                        }}
                        transformOrigin={{
                            horizontal: 'right',
                            vertical: 'top',
                        }}
                        disableScrollLock
                        open={menuOpen}
                        disablePortal
                        onClose={() => setMenuOpen(false)}>
                        <MenuItem
                            onClick={() => {
                                onDownload?.(file)
                                setMenuOpen(false)
                            }}>
                            <Typography className={classes.menuLabel}>{t.download()}</Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                onRename?.(file)
                                setMenuOpen(false)
                            }}>
                            <Typography className={classes.menuLabel}>{t.rename()}</Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                onDelete?.(file)
                                setMenuOpen(false)
                            }}>
                            <Typography className={classes.menuLabel} color={(theme) => theme.palette.maskColor.danger}>
                                {t.delete()}
                            </Typography>
                        </MenuItem>
                    </ShadowRootMenu>
                </div>
            }>
            <Typography className={classes.desc}>{formatFileSize(file.size, true)}</Typography>
            {file.key ? (
                <Typography className={classes.meta}>
                    <FileServiceTrans.file_key
                        components={{
                            key: <Typography className={classes.metaValue} component="span" />,
                        }}
                        values={{ key: file.key }}
                    />
                </Typography>
            ) : null}
        </FileFrame>
    )
})
