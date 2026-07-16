import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { usePostInfoPostID } from '@masknet/plugin-infra/content-script'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography, type BoxProps } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 35,
    },
    text: {
        color: theme.palette.maskColor.main,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        padding: 10,
    },
    button: {
        fontSize: '14px',
        fontWeight: 700,
        minWidth: theme.spacing(11),
        height: 40,
        padding: '11px 54px',
        boxSizing: 'border-box',
    },
}))

export const ClaimOnFirefly = memo(function ClaimOnFirefly({ className, ...rest }: BoxProps) {
    const { classes, cx } = useStyles()
    const postId = usePostInfoPostID()

    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <Typography className={classes.text}>
                <Trans>Discovered a LuckyDrop event on the FireFly website.</Trans>
            </Typography>
            <Button
                className={classes.button}
                onClick={() => {
                    openWindow(`https://firefly.social/post/x/${postId}`)
                }}
                variant="roundedContained"
                size="medium"
                startIcon={<Icons.LinkOut size={18} />}>
                <Trans>Claim Lucky Drop</Trans>
            </Button>
        </Box>
    )
})
