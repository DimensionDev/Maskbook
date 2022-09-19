import { first } from 'lodash-unified'
import { alpha, Box, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useAsync } from 'react-use'
import { PluginVCentRPC } from '../messages.js'
import { useI18N } from '../../../utils/index.js'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'
import { ImageIcon } from '@masknet/shared'
import { useNetworkDescriptor } from '@masknet/plugin-infra/web3'
import { VALUABLES_VCENT_URL } from '../constants'
import urlcat from 'urlcat'

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

export default function VCentDialog({ tweetAddress }: { tweetAddress: string }) {
    const { classes } = useStyle()
    const { t } = useI18N()
    const { value: tweets } = useAsync(() => PluginVCentRPC.getTweetData(tweetAddress), [tweetAddress])
    const tweet = first(tweets)
    usePluginWrapper(tweet?.type === 'Offer')
    const networkDescriptor = useNetworkDescriptor()
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
                    <Typography
                        sx={{ marginRight: 0.5 }}
                        fontWeight="bold"
                        fontSize={14}
                        color={(t) => t.palette.maskColor.second}>
                        {t('plugin_vcent_last_offer_at')}
                    </Typography>
                    <Typography fontWeight="bold" fontSize={14} color={(t) => t.palette.maskColor.publicMain}>
                        ${tweet.amount_usd}
                    </Typography>
                </Box>
            </Box>
            <Button
                variant="roundedContained"
                className={classes.button}
                target="_blank"
                href={urlcat(VALUABLES_VCENT_URL, tweet.tweet_id)}>
                {t('plugin_vcent_go')}
            </Button>
        </Box>
    )
}
