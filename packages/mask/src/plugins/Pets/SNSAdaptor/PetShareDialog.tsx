import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, Typography, Box } from '@mui/material'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useI18N } from '../../../utils'
import { Share_Twitter_TXT } from '../constants'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(0, 2.5),
    },
    shareNotice: {
        color: '#222',
        fontSize: '16px',
        fontFamily: 'TwitterChirp',
        lineHeight: '16px',
        marginTop: theme.spacing(2),
    },
    shareButton: {
        width: '100%',
        margin: theme.spacing(4, 0, 3),
    },
}))

interface PetSetDialogProps {
    onClose: () => void
}

export function PetShareDialog({ onClose }: PetSetDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const shareLink = activatedSocialNetworkUI.utils.getShareLinkURL?.('')

    const onShareClick = useCallback(() => {
        if (shareLink) {
            const search = '?text=' + Share_Twitter_TXT
            shareLink.search = search
            shareLink.href = shareLink.origin + shareLink.pathname + shareLink.search
            const share = shareLink.toString()
            window.open(share, '_blank', 'noopener noreferrer')
        }
        onClose()
    }, [shareLink])

    return (
        <Box className={classes.root}>
            <Typography className={classes.shareNotice}>{t('plugin_pets_dialog_success')}</Typography>
            <Button onClick={onShareClick} variant="contained" size="large" className={classes.shareButton}>
                {t('plugin_pets_dialog_btn_share')}
            </Button>
        </Box>
    )
}
