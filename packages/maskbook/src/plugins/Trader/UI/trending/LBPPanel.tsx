import {
    Theme,
    createStyles,
    makeStyles,
    Link,
    Button,
    Typography,
    CircularProgress,
    IconButton,
} from '@material-ui/core'
import RefreshIcon from '@material-ui/icons/Refresh'
import { LBPPriceChart } from './LBPPriceChart'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import type { ERC20TokenDetailed } from '../../../../web3/types'
import { usePoolTokenPrices } from '../../LBP/usePoolTokenPrices'
import { useCallback } from 'react'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            paddingBottom: theme.spacing(2),
        },
        chart: {
            position: 'relative',
        },
        introduce: {
            fontSize: 14,
            margin: theme.spacing(1, 0),
            padding: theme.spacing(0, 2.5),
        },
        connect: {
            padding: theme.spacing(0, 2.5),
            display: 'flex',
            justifyContent: 'flex-end',
            '& > div': {
                width: 'auto',
            },
        },
        progress: {
            zIndex: 1,
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
        },
        retry: {
            zIndex: 1,
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
        },
    }),
)

export interface LBPPanelProps extends withClasses<never> {
    token: ERC20TokenDetailed
    onBuyClick(): void
}

export function LBPPanel(props: LBPPanelProps) {
    const { token } = props
    const classes = useStylesExtends(useStyles(props), props)
    const { value: prices = [], loading: pricesLoading, error: pricesError, retry: pricesRetry } = usePoolTokenPrices(
        token.address,
        3 * 24 * 60 * 60,
    )

    return (
        <div className={classes.root}>
            <div className={classes.chart}>
                {pricesLoading ? <CircularProgress className={classes.progress} color="primary" size={15} /> : null}
                {pricesError ? (
                    <IconButton
                        className={classes.retry}
                        size="small"
                        onClick={() => {
                            pricesRetry()
                        }}>
                        <RefreshIcon />
                    </IconButton>
                ) : null}
                <LBPPriceChart
                    data={
                        pricesLoading
                            ? []
                            : prices.map((x) => ({
                                  date: new Date(x.timestamp * 1000),
                                  value: x.price,
                              }))
                    }
                />
            </div>
            <Typography className={classes.introduce}>
                Solid blue line illustrates the historical price of MASK on the {token.symbol}'s LBP. Dashed line
                represents the future price <strong>if no one buys MASK We do not advise </strong>
                buying ${token.symbol} at the very beginning of the LBP offering
            </Typography>
            <Typography className={classes.introduce}>
                <Link>What's LBP</Link>, <Link>Tutorial </Link>
                and
                <Link> {token.symbol} LBP Pool in Balancer</Link>.
            </Typography>
            <div className={classes.connect}>
                <Button variant="contained" onClick={props.onBuyClick}>
                    Buy
                </Button>
            </div>
        </div>
    )
}
