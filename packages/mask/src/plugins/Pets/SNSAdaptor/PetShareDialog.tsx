import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, Typography, Box } from '@mui/material'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useI18N } from '../locales'
import { Share_Twitter_TXT } from '../constants'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(0, 2.5),
    },
    shareNotice: {
        color: theme.palette.maskColor.main,
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
    const t = useI18N()
    const { classes } = useStyles()

    const onShareClick = useCallback(() => {
        activatedSocialNetworkUI.utils.share?.(Share_Twitter_TXT)
        onClose()
    }, [onClose])

    return (
        <Box className={classes.root}>
            <Typography className={classes.shareNotice}>{t.pets_dialog_success()}</Typography>
            <Button onClick={onShareClick} size="large" className={classes.shareButton}>
                {t.pets_dialog_btn_share()}
            </Button>
        </Box>
    )
}
