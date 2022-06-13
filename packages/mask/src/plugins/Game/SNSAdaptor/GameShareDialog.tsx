import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, Typography, Box } from '@mui/material'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useI18N } from '../../../utils'
import { Share_Twitter_TXT } from '../constants'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(0, 2.5),
        zIndex: 99999,
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
    shareUrl: string
}

export default function GameShareDialog({ onClose, shareUrl }: PetSetDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const onShareClick = useCallback(() => {
        activatedSocialNetworkUI.utils.share?.(`${Share_Twitter_TXT}${shareUrl}`)
        onClose()
    }, [onClose])

    return (
        <Box className={classes.root}>
            <Typography className={classes.shareNotice}>{t('plugin_game_dialog_info')}</Typography>
            <Button onClick={onShareClick} variant="contained" size="large" className={classes.shareButton}>
                {t('plugin_game_share_btn')}
            </Button>
        </Box>
    )
}
