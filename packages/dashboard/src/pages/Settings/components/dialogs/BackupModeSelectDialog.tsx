import { MaskColorVar, MaskDialog } from '@masknet/theme'
import { Box, DialogContent, Tooltip, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { LocalBackupIcon, CloudBackupIcon } from '@masknet/icons'
import { useContext, useMemo } from 'react'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        height: '220px',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingBottom: '20px',
    },
    mode: {
        position: 'relative',
        width: '110px',
        height: '116px',
        background: MaskColorVar.lightBackground,
        textAlign: 'center',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        '&:not(.disabled):hover': {
            background: MaskColorVar.primaryBackground,
            boxShadow: '3px 6px 15px rgba(28, 104, 243, 0.1)',
        },
    },
    icon: {
        width: '60px',
        height: '60px',
    },
    label: {
        paddingTop: '10px',
        fontSize: '13px',
    },
    mask: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        borderRadius: '8px',
        background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.4)',
    },
}))
export interface BackupModeSelectDialogProps {
    open: boolean
    onClose(): void
    onSelect(mode: 'local' | 'cloud'): void
}

export default function BackupModeSelectDialog({ open, onClose, onSelect }: BackupModeSelectDialogProps) {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { user } = useContext(UserContext)

    const cloudDisabled = useMemo(() => {
        return !user.email && !user.phone
    }, [user.email, user.phone])

    return (
        <MaskDialog title={t.settings_button_backup()} open={open} onClose={onClose}>
            <DialogContent>
                <Box className={classes.container}>
                    <Box className={classes.mode} onClick={() => onSelect('local')}>
                        <LocalBackupIcon className={classes.icon} />
                        <Typography className={classes.label}>Local Backup</Typography>
                    </Box>
                    <Box className={classNames(classes.mode, cloudDisabled && 'disabled')}>
                        {cloudDisabled ? (
                            <Tooltip title={t.settings_dialogs_bind_email_or_phone()} placement="top" arrow>
                                <div className={classes.mask} />
                            </Tooltip>
                        ) : null}

                        <CloudBackupIcon className={classes.icon} onClick={() => onSelect('cloud')} />
                        <Typography className={classes.label}>Cloud Backup</Typography>
                    </Box>
                </Box>
            </DialogContent>
        </MaskDialog>
    )
}
