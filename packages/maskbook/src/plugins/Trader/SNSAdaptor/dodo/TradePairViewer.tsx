import { ExternalLink } from 'react-feather'
import { Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { resolveTradePairLink } from '../../pipes'
import type { SwapRouteData, TradeComputed, TradeProvider } from '../../types'
import { useNetworkType } from '@masknet/web3-shared'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 15,
            padding: theme.spacing(1, 2),
            margin: theme.spacing(0, 0, 2),
        },
        link: {
            display: 'block',
        },
        text: {},
        icon: {
            verticalAlign: 'middle',
            marginLeft: theme.spacing(0.5),
        },
    }
})

export interface TradePairViewerProps {
    trade: TradeComputed<SwapRouteData>
    provider: TradeProvider
}

export function TradePairViewer(props: TradePairViewerProps) {
    const { trade, provider } = props
    const { classes } = useStyles()
    const networkType = useNetworkType()

    if (!trade.trade_?.fromTokenSymbol || !trade.trade_?.toTokenSymbol) return null
    const address = `${trade.trade_?.fromTokenSymbol}-${trade.trade_?.toTokenSymbol}`

    return (
        <div className={classes.root}>
            <Link
                className={classes.link}
                align="center"
                color="textSecondary"
                href={resolveTradePairLink(provider, address, networkType)}
                target="_blank"
                rel="noopener noreferrer">
                <Typography className={classes.text} color="textSecondary" variant="body2" component="span">
                    View pair analytics
                </Typography>
                <Typography className={classes.icon} color="textSecondary" variant="body2" component="span">
                    <ExternalLink size={14} />
                </Typography>
            </Link>
        </div>
    )
}
