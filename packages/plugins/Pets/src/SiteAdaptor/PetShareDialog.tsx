import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { useCallback } from 'react'
import { share } from '@masknet/plugin-infra/content-script/context'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { _ } = useLingui()
    const { classes } = useStyles()

    const onShareClick = useCallback(() => {
        share?.(
            _(msg`I just set up NFT personal image with @realMaskNetwork chrome extension. Visit my profile to check it out. Install Mask Network extension from mask.io and set yours.
#mask_io #nonfungiblefriends
⚙ Setting steps: https://x.com/NonFFriend/status/1508791087149641731`),
        )
        onClose()
    }, [onClose])

    return (
        <Box className={classes.root}>
            <Box className={classes.content}>
                <Typography className={classes.notice}>
                    <Trans>Your Non-Fungible Friend has been set up successfully.</Trans>
                </Typography>
            </Box>
            <Button onClick={onShareClick} size="large" className={classes.button}>
                <Trans>Share</Trans>
            </Button>
        </Box>
    )
}
