import { Icons } from '@masknet/icons'
import { Image, NetworkIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { Translate } from '../../../locales/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType, getPlatformIcon } from '../share.js'
import { Label, formatValue } from './common.js'

const useStyles = makeStyles<void, 'tokenIcon' | 'verboseToken'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
    tokenIcon: {},
    verboseToken: {},
    token: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(1),
        color: theme.palette.maskColor.main,
        [`.${refs.tokenIcon}`]: {
            width: 32,
            height: 32,
            borderRadius: '50%',
            overflow: 'hidden',
        },
        [`&.${refs.verboseToken}`]: {
            height: 186,
            justifyContent: 'center',
        },
    },
    tokenValue: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    bridgePair: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isTokenBridgeFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenBridgeFeed {
    return feed.tag === Tag.Transaction && feed.type === Type.Bridge
}

interface TokenBridgeCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenBridgeFeed
}

/**
 * TokenBridgeCard
 * Including:
 *
 * - TokenBridge
 */
export function TokenBridgeCard({ feed, ...rest }: TokenBridgeCardProps) {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    // You might see some `transfer` type actions as well
    const action = feed.actions.filter((x) => x.tag === Tag.Transaction && x.type === Type.Bridge)[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)
    const FromNetworkIcon = getPlatformIcon(feed.network) || Icons.ETH

    return (
        <CardFrame type={CardType.TokenBridge} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.token_bridge
                    values={{
                        user,
                        amount: formatValue(metadata?.token),
                        symbol: metadata!.token.symbol,
                        source: feed.network,
                        target: metadata!.target_network.name,
                    }}
                    components={{
                        user: <Label title={feed.owner} />,
                        platform: <Label title={feed.platform!} sx={{ textTransform: 'capitalize' }} />,
                        bold: <Label />,
                    }}
                />
            </Typography>
            {metadata ? (
                <div className={cx(classes.token, verbose ? classes.verboseToken : null)}>
                    <div className={classes.bridgePair}>
                        <FromNetworkIcon size={32} />
                        <div className={classes.tokenValue}>
                            <Icons.RSS3Link height={2} width={9} />
                            <Image
                                classes={{ container: classes.tokenIcon }}
                                src={metadata.token.image}
                                fallback={<img src={metadata.token.image} className={classes.tokenIcon} />}
                                height={18}
                                width={18}
                            />
                            <Typography fontWeight={700} mr={1.5}>
                                {formatValue(metadata.token)} {metadata.token.symbol}
                            </Typography>
                            <Icons.RSS3Link height={2} width={9} />
                        </div>
                        <NetworkIcon
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                            chainId={metadata.target_network.chain_id}
                            ImageIconProps={{ size: 32 }}
                        />
                    </div>
                </div>
            ) : null}
        </CardFrame>
    )
}
