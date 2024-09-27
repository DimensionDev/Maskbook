import { Icons } from '@masknet/icons'
import { formatFileSize } from '@masknet/kit'
import { FileFrame } from '@masknet/shared'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { MenuItem, Typography } from '@mui/material'
import { memo, useRef, useState } from 'react'
import type { FileBaseProps, FileInfo } from '../../../types.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    meta: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.third,
    },
    metaValue: {
        fontSize: 12,
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
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        padding: '6px',
    },
    menu: {
        minWidth: 229,
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 4px 30px 0px rgba(255, 255, 255, 0.15)'
            :   '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
    },
    rightGap: {
        marginRight: '24px',
    },
    bottomGap: {
        marginBottom: '12px',
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
                            }}
                            className={classes.bottomGap}>
                            <Typography className={classes.menuLabel}>
                                <Trans>Download</Trans>
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                onRename?.(file)
                                setMenuOpen(false)
                            }}
                            className={classes.bottomGap}>
                            <Typography className={classes.menuLabel}>
                                <Trans>Rename</Trans>
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                onDelete?.(file)
                                setMenuOpen(false)
                            }}>
                            <Typography className={classes.menuLabel} color={(theme) => theme.palette.maskColor.danger}>
                                <Trans>Delete</Trans>
                            </Typography>
                        </MenuItem>
                    </ShadowRootMenu>
                </div>
            }>
            <div className={classes.row}>
                <Typography className={classes.meta}>
                    <Trans>size</Trans>:
                </Typography>
                <Typography className={cx(classes.metaValue, classes.rightGap)}>
                    {formatFileSize(file.size, true)}
                </Typography>
                {file.key ?
                    <Typography className={classes.meta}>
                        <Trans>
                            File Key:{' '}
                            <Typography className={classes.metaValue} component="span">
                                {file.key}
                            </Typography>
                        </Trans>
                    </Typography>
                :   null}
            </div>
        </FileFrame>
    )
})
