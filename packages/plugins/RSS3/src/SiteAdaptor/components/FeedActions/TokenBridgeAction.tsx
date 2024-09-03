import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label, formatValue } from '../common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

const { Tag, Type } = RSS3BaseAPI

interface TokenBridgeActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenBridgeFeed
}

/**
 * TokenBridgeAction
 * Including:
 *
 * - TokenBridge
 */
export function TokenBridgeAction({ feed, ...rest }: TokenBridgeActionProps) {
    const { classes } = useStyles()

    // You might see some `transfer` type actions as well
    const action = feed.actions.filter((x) => x.tag === Tag.Transaction && x.type === Type.Bridge)[0]
    const metadata = action.metadata

    const user = useAddressLabel(feed.owner)

    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                {/* eslint-disable-next-line react/naming-convention/component-name */}
                <RSS3Trans.tokenBridge
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
        </div>
    )
}
