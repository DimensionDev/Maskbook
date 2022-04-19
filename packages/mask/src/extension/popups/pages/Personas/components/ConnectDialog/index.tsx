import { memo } from 'react'
import type { DialogProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import { useI18N } from '../../../../../../utils'
import { Close } from '@mui/icons-material'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING, SOCIAL_MEDIA_NAME } from '@masknet/shared'
import type { EnhanceableSite } from '@masknet/shared-base'

const useStyles = makeStyles()(() => ({
    dialog: {
        margin: 15,
    },
    title: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    text: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 700,
        marginTop: 7,
        flex: 1,
        textAlign: 'center',
    },
    close: {
        color: '#7B8192',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 16,
    },
    item: {
        backgroundColor: '#F7F9FA',
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    networkIcon: {
        width: 24,
        height: 24,
        '& > svg': {
            borderRadius: 99,
        },
    },
    network: {
        marginLeft: 4,
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
}))

interface ConnectDialogProps extends DialogProps {
    onClose: () => void
    onConnect: (networkIdentifier: EnhanceableSite) => void
    networks: EnhanceableSite[]
}

export const ConnectDialog = memo<ConnectDialogProps>(({ open, onClose, networks, onConnect }) => {
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <Dialog open={open} onClose={onClose} classes={{ paper: classes.dialog }}>
            <DialogTitle className={classes.title}>
                <Typography className={classes.text}>{t('popups_connect_social_account')}</Typography>
                <IconButton size="small" onClick={onClose} edge="end" color="inherit" className={classes.close}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.content}>
                {networks.map((networkIdentifier) => (
                    <div className={classes.item} key={networkIdentifier} onClick={() => onConnect(networkIdentifier)}>
                        <div className={classes.networkIcon}>{SOCIAL_MEDIA_ROUND_ICON_MAPPING[networkIdentifier]}</div>
                        <Typography className={classes.network}>{SOCIAL_MEDIA_NAME[networkIdentifier]}</Typography>
                    </div>
                ))}
            </DialogContent>
        </Dialog>
    )
})
