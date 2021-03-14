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
import { formatEthereumAddress } from '../../../Wallet/formatter'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../../web3/constants'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { usePools } from '../../LBP/usePools'

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
    }),
)

export interface LBPPanelProps extends withClasses<never> {
    duration: number
    token: ERC20TokenDetailed
}

export function LBPPanel(props: LBPPanelProps) {
    const { token, duration } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(props), props)

    const USDC_ADDRESS = useConstant(CONSTANTS, 'USDC_ADDRESS')
    const { value: pools = [], loading: poolsLoading, error: poolsError } = usePools(token.address)
    const { value: prices = [], loading: pricesLoading, error: pricesError, retry: pricesRetry } = usePoolTokenPrices(
        token.address,
        duration,
        100,
    )

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
                    href={`https://news.mask.io/2021/02/24/mask-lbp-tutorial`}
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
