import { MaskColorVar, MaskDialog } from '@masknet/theme'
import { Box, makeStyles, Typography } from '@material-ui/core'
import { LocalBackupIcon, CloudBackupIcon } from '@masknet/icons'

const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        height: '220px',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingBottom: '20px',
    },
    mode: {
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
        '&:hover': {
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
}))

export interface BackupModeSelectDialogProps {
    open: boolean
    onClose(): void
    onSelect(mode: 'local' | 'cloud'): void
}

export default function BackupModeSelectDialog({ open, onClose, onSelect }: BackupModeSelectDialogProps) {
    const classes = useStyles()
    return (
        <MaskDialog title="Backup" open={open} onClose={onClose}>
            <Box className={classes.container}>
                <Box className={classes.mode} onClick={() => onSelect('local')}>
                    <LocalBackupIcon className={classes.icon} />
                    <Typography className={classes.label}>Local Backup</Typography>
                </Box>
                <Box className={classes.mode}>
                    <CloudBackupIcon className={classes.icon} onClick={() => onSelect('cloud')} />
                    <Typography className={classes.label}>Cloud Backup</Typography>
                </Box>
            </Box>
        </MaskDialog>
    )
}
