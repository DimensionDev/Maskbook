import { first } from 'lodash-unified'
import { Box, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useAsync } from 'react-use'
import { PluginVCentRPC } from '../messages.js'
import { useI18N } from '../../../utils/index.js'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'
import { ImageIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useNetworkDescriptor } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'
import Color from 'color'
import { VALUABLES_VCENT_URL } from '../constants'

const useStyle = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(1.5),
        display: 'flex',
        gap: theme.spacing(1),
        backgroundColor: new Color(theme.palette.maskColor.white).alpha(0.8).toString(),
        padding: theme.spacing(1),
        alignItems: 'center',
        borderRadius: 8,
    },
    twitter: {
        fill: '#1D9BF0',
        width: 30,
        height: 30,
        filter: 'drop-shadow(0px 6px 12px rgba(29, 155, 240, 0.2))',
        backdropFilter: 'blur(8px)',
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
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, ChainId.Mainnet)
    // only offer tweets
    if (tweet?.type !== 'Offer') return null

    return (
        <Box className={classes.root}>
            <Icons.TwitterColored className={classes.twitter} />
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
                href={VALUABLES_VCENT_URL + tweet.tweet_id}>
                {t('plugin_vcent_go')}
            </Button>
        </Box>
    )
}
