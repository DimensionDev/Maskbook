import { makeStyles } from '@masknet/theme'
import { DialogContent, Link, Typography } from '@mui/material'
import { memo } from 'react'
import { SmartPayBanner } from './SmartPayBanner.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    dialogContent: {
        padding: theme.spacing(2),
        minHeight: 564,
        boxSizing: 'border-box',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
    },
    description: {
        marginTop: theme.spacing(1.5),
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        '& > a': {
            color: theme.palette.maskColor.highlight,
        },
    },
}))

export const InEligibilityTips = memo(() => {
    const { classes } = useStyles()
    return (
        <DialogContent className={classes.dialogContent}>
            <SmartPayBanner>
                <Typography>
                    <Trans>Sorry, you are not in the free trial whitelist.</Trans>
                </Typography>
            </SmartPayBanner>
            <Typography className={classes.description}>
                <Trans>
                    You can follow Mask Network{' '}
                    <Link href="https://x.com/realMaskNetwork" rel="noopener noreferrer" target="_blank">
                        Twitter
                    </Link>{' '}
                    or{' '}
                    <Link href="https://discord.com/invite/4SVXvj7" rel="noopener noreferrer" target="_blank">
                        Discord
                    </Link>{' '}
                    to participate in the event and get free qualification to have gas-free blockchain experiences with
                    SmartPay. Soon we will publish the second batch of users participating in the test!
                </Trans>
            </Typography>
            <Typography className={classes.description}>
                <Trans>
                    Click{' '}
                    <Link href="https://forms.gle/HpzvPVj1MUQmw5Rp9" rel="noopener noreferrer" target="_blank">
                        here
                    </Link>{' '}
                    and fill the SmartPay Wallet whitelist application form.
                </Trans>
            </Typography>
        </DialogContent>
    )
})
