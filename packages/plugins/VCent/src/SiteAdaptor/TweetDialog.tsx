import { Icons } from '@masknet/icons'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { ImageIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { alpha, Box, Button, Typography } from '@mui/material'
import { first } from 'lodash-es'
import { memo } from 'react'
import { useAsync } from 'react-use'
import urlcat from 'urlcat'
import { VALUABLES_VCENT_URL } from '../constants.js'
import { PluginVCentRPC } from '../messages.js'
import { Trans } from '@lingui/macro'

const useStyle = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(1.5),
        display: 'flex',
        gap: theme.spacing(1),
        backgroundColor: alpha(theme.palette.maskColor.white, 0.8),
        padding: theme.spacing(1),
        alignItems: 'center',
        borderRadius: 8,
    },
    twitter: {
        width: 30,
        height: 30,
        filter: 'drop-shadow(0px 6px 12px rgba(29, 155, 240, 0.2))',
        backdropFilter: 'blur(8px)',
        fill: theme.palette.maskColor.publicTwitter,
    },
    content: {
        flex: 1,
    },
    title: {
        display: 'flex',
        alignItems: 'center',
    },
    fieldName: {
        marginRight: theme.spacing(0.5),
        fontWeight: 'bold',
        fontSize: 14,
        color: theme.palette.maskColor.publicSecond,
    },
    button: {
        backgroundColor: theme.palette.maskColor.publicMain,
        color: theme.palette.maskColor.white,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
        height: 32,
        width: 60,
    },
}))

export const VCentDialog = memo(function VCentDialog({ tweetAddress }: { tweetAddress: string }) {
    const { classes } = useStyle()
    const { value: tweets } = useAsync(() => PluginVCentRPC.getTweetData(tweetAddress), [tweetAddress])
    const tweet = first(tweets)
    usePluginWrapper(tweet?.type === 'Offer')
    const networkDescriptor = useNetworkDescriptor(undefined, ChainId.Mainnet)
    // only offer tweets
    if (tweet?.type !== 'Offer') return null

    return (
        <Box className={classes.root}>
            <Icons.TwitterOtherColored className={classes.twitter} />
            <Box className={classes.content}>
                <Box className={classes.title}>
                    <ImageIcon icon={networkDescriptor?.icon} size={20} />
                    <Typography fontWeight="bold" fontSize={14} lineHeight="18px" sx={{ marginLeft: 0.5 }}>
                        {tweet.amount_eth.toFixed(4)}
                    </Typography>
                </Box>
                <Box className={classes.title}>
                    <Trans>
                        <Typography className={classes.fieldName}>Latest offer at </Typography>
                        <Typography fontWeight="bold" fontSize={14} color={(t) => t.palette.maskColor.publicMain}>
                            ${tweet.amount_usd}
                        </Typography>
                    </Trans>
                </Box>
            </Box>
            <Button
                variant="roundedContained"
                className={classes.button}
                target="_blank"
                href={urlcat(VALUABLES_VCENT_URL, tweet.tweet_id)}>
                <Trans>Go</Trans>
            </Button>
        </Box>
    )
})
