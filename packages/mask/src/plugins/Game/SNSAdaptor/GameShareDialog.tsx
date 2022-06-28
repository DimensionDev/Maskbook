import { useCallback } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Button, Typography, Box } from '@mui/material'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useI18N } from '../../../utils'
import type { GameInfo } from '../types'
import { Share_Twitter } from '../constants'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(0, 2.5),
        zIndex: 99999,
    },
    shareNotice: {
        color: MaskColorVar.normalText,
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
    gameInfo: GameInfo | undefined
}

export default function GameShareDialog({ onClose, gameInfo }: PetSetDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const shareText = `I'm playing ${gameInfo?.name} by @NonFFriend ${gameInfo?.twitterId} on my Twitter profile. Install the Mask Network Extension mask.io  and JOIN ME!\n #mask_io #NFF #NFTgame\n${Share_Twitter}`

    const onShareClick = useCallback(() => {
        activatedSocialNetworkUI.utils.share?.(shareText)
        onClose()
    }, [shareText, onClose])

    return (
        <Box className={classes.root}>
            <Typography className={classes.shareNotice}>{t('plugin_game_dialog_info')}</Typography>
            <Button onClick={onShareClick} variant="contained" size="large" className={classes.shareButton}>
                {t('plugin_game_share_btn')}
            </Button>
        </Box>
    )
}
