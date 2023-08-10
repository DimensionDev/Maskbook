import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, Typography, Box } from '@mui/material'
import { useI18N } from '../locales/index.js'
import type { GameInfo } from '../types.js'
import { Share_Twitter } from '../constants.js'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/dom'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(0, 2.5),
        zIndex: 99999,
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
    gameInfo: GameInfo | undefined
}

export default function GameShareDialog({ onClose, gameInfo }: PetSetDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const { share } = useSNSAdaptorContext()

    const onShareClick = useCallback(() => {
        share?.(
            t.game_share_text({
                name: gameInfo?.name ?? '',
                snsId: gameInfo?.snsId ?? '',
                share_Twitter: Share_Twitter,
            }),
        )
        onClose()
    }, [gameInfo?.name, gameInfo?.snsId, onClose, share])

    return (
        <Box className={classes.root}>
            <Typography className={classes.shareNotice}>{t.game_dialog_info()}</Typography>
            <Button onClick={onShareClick} variant="contained" size="large" className={classes.shareButton}>
                {t.game_share_btn()}
            </Button>
        </Box>
    )
}
