import type { ERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { formatEthereumAddress, useTokenConstants } from '@masknet/web3-shared-evm'
import { Button, CircularProgress, IconButton, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useStylesExtends } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { usePools } from '../../LBP/usePools'
import { usePoolTokenPrices } from '../../LBP/usePoolTokenPrices'
import type { Currency } from '../../types'
import { LBPPriceChart } from './LBPPriceChart'

const useStyles = makeStyles()((theme) => ({
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
    placeholder: {
        color: theme.palette.text.secondary,
        padding: theme.spacing(2, 2, 0),
        textAlign: 'center',
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
}))

export interface LBPPanelProps extends withClasses<never> {
    duration: number
    token: ERC20TokenDetailed
    currency: Currency
}

export function LBPPanel(props: LBPPanelProps) {
    const { token, duration } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const { USDC_ADDRESS } = useTokenConstants()
    const { value: pools = [], loading: poolsLoading, error: poolsError } = usePools(token.address)
    const {
        value: prices = [],
        loading: pricesLoading,
        error: pricesError,
        retry: pricesRetry,
    } = usePoolTokenPrices(token.address, duration, 100)

    if (!pools.length)
        return (
            <div className={classes.root}>
                <div className={classes.chart}>
                    <Typography className={classes.placeholder}>No pools found.</Typography>
                </div>
            </div>
        )

    return (
        <div className={classes.root}>
            <div className={classes.chart}>
                {pricesLoading || poolsLoading ? (
                    <CircularProgress className={classes.progress} color="primary" size={15} />
                ) : pricesError || poolsError ? (
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
                        pricesLoading || poolsLoading
                            ? []
                            : prices.map((x) => ({
                                  date: new Date(x.timestamp * 1000),
                                  value: x.price,
                              }))
                    }
                    currency={props.currency}
                />
            </div>
            <Typography className={classes.introduce}>
                Solid blue line illustrates the historical price of {token.symbol ?? 'Token'} on the{' '}
                {token.symbol ?? 'Token'}'s LBP. The price could continue to go down if no one buys. Please make your
                investment decision wisely.
            </Typography>
            <Typography className={classes.introduce}>
                <Link href="https://link.medium.com/0kfZVzGx8db" target="_blank" rel="noopener noreferrer">
                    What's LBP?
                </Link>
                ,{' '}
                <Link
                    href="https://news.mask.io/2021/02/24/mask-lbp-tutorial"
                    target="_blank"
                    rel="noopener noreferrer">
                    Tutorial
                </Link>{' '}
                and{' '}
                <Link
                    href={`https://pools.balancer.exchange/#/pool/${pools[0].id}/`}
                    target="_blank"
                    rel="noopener noreferrer">
                    {token.symbol} LBP Pool in Balancer
                </Link>
                .
            </Typography>
            <div className={classes.connect}>
                <Button
                    color="primary"
                    variant="contained"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://balancer.exchange/#/swap/${formatEthereumAddress(token.address)}/${USDC_ADDRESS}`}>
                    {t('plugin_trader_buy')}
                </Button>
            </div>
        </div>
    )
}
