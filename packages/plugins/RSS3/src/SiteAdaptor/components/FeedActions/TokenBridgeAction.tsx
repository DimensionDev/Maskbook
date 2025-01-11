import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label, formatValue } from '../common.js'
import { Trans } from '@lingui/react/macro'

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

    const amount = formatValue(metadata?.token)
    const symbol = metadata!.token.symbol
    const source = feed.network
    const target = metadata!.target_network.name
    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                <Trans>
                    <Label title={feed.owner}>{user}</Label> bridged{' '}
                    <Label>
                        {amount} {symbol}
                    </Label>{' '}
                    from{' '}
                    <Label title={feed.platform!} sx={{ textTransform: 'capitalize' }}>
                        {source}
                    </Label>{' '}
                    to{' '}
                    <Label title={feed.platform!} sx={{ textTransform: 'capitalize' }}>
                        {target}
                    </Label>
                </Trans>
            </Typography>
        </div>
    )
}
