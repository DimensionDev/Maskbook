import { ExternalLink } from 'react-feather'
import { Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { resolveTradePairLink } from '../../pipes'
import type { TradeComputed } from '../../types'
import { useNetworkType } from '@masknet/web3-shared'
import type { TradeProvider } from '@masknet/public-api'

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

type Tokens = { fromTokenSymbol?: string; toTokenSymbol?: string }

export function TradePairViewer<T extends Tokens>(props: { trade: TradeComputed<T>; provider: TradeProvider }) {
    const { trade, provider } = props
    const { classes } = useStyles()
    const networkType = useNetworkType()

    if (!trade.trade_?.fromTokenSymbol || !trade.trade_?.toTokenSymbol) return null
    const address = `${trade.trade_?.fromTokenSymbol}-${trade.trade_?.toTokenSymbol}`
    const tradePairLink = resolveTradePairLink(provider, address, networkType)

    if (!tradePairLink) return null

    return (
        <div className={classes.root}>
            <Link
                className={classes.link}
                align="center"
                color="textSecondary"
                href={tradePairLink}
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
