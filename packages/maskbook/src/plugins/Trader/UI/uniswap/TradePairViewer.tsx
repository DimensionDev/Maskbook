import { ExternalLink } from 'react-feather'
import type { Trade } from '@uniswap/sdk'
import { createStyles, Link, makeStyles, Typography } from '@material-ui/core'
import { resolveTradePairLink } from '../../pipes'
import type { TradeComputed, TradeProvider } from '../../types'
import { useContext } from 'react'
import { TradeContext } from '../../trader/useTradeContext'
import { getPairAddress } from '../../helpers'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
    })
})

export interface TradePairViewerProps {
    trade: TradeComputed<Trade>
    provider: TradeProvider
}

export function TradePairViewer(props: TradePairViewerProps) {
    const { trade, provider } = props
    const classes = useStyles()

    const context = useContext(TradeContext)
    const address = getPairAddress(
        context?.FACTORY_CONTRACT_ADDRESS ?? '',
        context?.INIT_CODE_HASH ?? '',
        trade.trade_?.route.pairs[0].token0,
        trade.trade_?.route.pairs[0].token1,
    )
    if (!address) return null

    return (
        <div className={classes.root}>
            <Link
                className={classes.link}
                align="center"
                color="textSecondary"
                href={resolveTradePairLink(provider, address.toLowerCase())}
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
