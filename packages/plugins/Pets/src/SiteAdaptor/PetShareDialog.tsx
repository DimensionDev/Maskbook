import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { useCallback } from 'react'
import { useI18N } from '../locales/index.js'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(0, 2.5),
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    notice: {
        color: theme.palette.maskColor.main,
        fontSize: '16px',
        fontFamily: 'TwitterChirp',
        lineHeight: '16px',
        marginTop: theme.spacing(2),
    },
    button: {
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
    const context = useSiteAdaptorContext()

    const onShareClick = useCallback(() => {
        context?.share?.(t.share_twitter())
        onClose()
    }, [onClose, context?.share])

    return (
        <Box className={classes.root}>
            <Box className={classes.content}>
                <Typography className={classes.notice}>{t.pets_dialog_success()}</Typography>
            </Box>
            <Button onClick={onShareClick} size="large" className={classes.button}>
                {t.pets_dialog_btn_share()}
            </Button>
        </Box>
    )
}
