import {
    TableContainer,
    Table,
    Paper,
    Card,
    Box,
    makeStyles,
    Typography,
    LinearProgress,
    TableRow,
    TableHead,
    TableCell,
    TableBody,
} from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed'
import { usePoolTradeInfo } from '../hooks/usePoolTradeInfo'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { debugModeSetting } from '../../../settings/settings'
import { formatBalance, FormattedBalance } from '@dimensiondev/maskbook-shared'
import { dateTimeFormat } from '../assets/formatDate'
import { JSON_PayloadInMask, ITO_Status } from '../types'
import { MSG_DELIMITER } from '../constants'

const useStyles = makeStyles((theme) => ({
    top: {
        width: '100%',
        boxSizing: 'border-box',
        padding: theme.spacing(1, 2, 1),
    },
    root: {
        borderRadius: 10,
        display: 'flex',
        padding: theme.spacing(2),
    },
    iconbar: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: theme.spacing(0.5),
        paddingRight: theme.spacing(1),
    },
    icon: {
        width: 32,
        height: 32,
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        paddingBottom: theme.spacing(1),
    },
    button: {
        borderRadius: 50,
    },
    title: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: theme.spacing(1),
    },
    date: {
        fontSize: 12,
    },
    progress: {
        paddingBottom: theme.spacing(1),
    },
    price: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingBottom: theme.spacing(1),
    },
    deteils: {
        '& > *': {
            paddingBottom: theme.spacing(1),
        },
    },
    table: {
        paddingBottom: theme.spacing(1),
        borderRadius: 0,
    },
    cell: {
        border: '1px solid rgba(224, 224, 224, 1)',
        color: theme.palette.text.primary,
        wordBreak: 'break-word',
    },
    head: {
        border: '1px solid rgba(224, 224, 224, 1)',
        color: theme.palette.text.secondary,
    },
}))

export interface PoolInListProps {
    pool: JSON_PayloadInMask
    exchange_in_volumes: string[]
    exchange_out_volumes: string[]
    onSend?: (pool: JSON_PayloadInMask) => void
    onWithdraw?: (payload: JSON_PayloadInMask) => void
}

export function PoolInList(props: PoolInListProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { pool, exchange_in_volumes, exchange_out_volumes, onSend, onWithdraw } = props

    const account = useAccount()
    const {
        value: availability,
        computed: availabilityComputed,
        loading: loadingAvailability,
    } = useAvailabilityComputed(pool)
    const { value: tradeInfo, loading: loadingTradeInfo } = usePoolTradeInfo(pool.pid, account)
    const title = pool.message.split(MSG_DELIMITER)[1] ?? pool.message
    const noRemain = new BigNumber(pool.total_remaining).isZero()
    const { listOfStatus } = availabilityComputed

    const isWithdrawn = tradeInfo?.destructInfo

    const canWithdraw = !isWithdrawn && (listOfStatus.includes(ITO_Status.expired) || noRemain)

    const canSend = !listOfStatus.includes(ITO_Status.expired) && !noRemain
    const progress = 100 * Number(new BigNumber(pool.total).minus(pool.total_remaining).div(pool.total))

    const StatusButton = () => {
        return (
            <>
                {loadingTradeInfo || loadingAvailability ? null : canWithdraw ? (
                    <ActionButton size="small" variant="contained" onClick={() => onWithdraw?.(pool)}>
                        {t('plugin_ito_withdraw')}
                    </ActionButton>
                ) : canSend ? (
                    <ActionButton size="small" variant="contained" onClick={() => onSend?.(pool)}>
                        {t('plugin_ito_list_button_send')}
                    </ActionButton>
                ) : isWithdrawn ? (
                    <ActionButton size="small" variant="contained" disabled={true}>
                        {t('plugin_ito_withdrawn')}
                    </ActionButton>
                ) : null}
            </>
        )
    }

    return (
        <div className={classes.top}>
            <Card className={classes.root} variant="outlined">
                <Box className={classes.iconbar}>
                    <TokenIcon classes={{ icon: classes.icon }} address={pool.token.address} />
                </Box>
                <Box className={classes.content}>
                    <Box className={classes.header}>
                        <Box className={classes.title}>
                            <Typography variant="body1" color="textPrimary">
                                {title}
                            </Typography>
                            <Typography className={classes.date} variant="body2" color="textSecondary">
                                {t('plugin_ito_list_start_date', {
                                    date: dateTimeFormat(new Date(pool.start_time)),
                                })}
                            </Typography>
                            <Typography className={classes.date} variant="body2" color="textSecondary">
                                {t('plugin_ito_list_end_date', {
                                    date: dateTimeFormat(new Date(pool.end_time)),
                                })}
                            </Typography>
                            {debugModeSetting.value ? (
                                <Typography className={classes.date} variant="body2" color="textSecondary">
                                    {t('plugin_ito_password', {
                                        password: pool.password === '' ? 'no password' : pool.password,
                                    })}
                                </Typography>
                            ) : null}
                        </Box>
                        <Box className={classes.button}>
                            <StatusButton />
                        </Box>
                    </Box>
                    <Box className={classes.progress}>
                        <LinearProgress variant="determinate" value={progress} />
                    </Box>

                    <Box className={classes.price}>
                        <Typography variant="body2" color="textSecondary" component="span">
                            {t('plugin_ito_list_sold_total')}
                            <Typography variant="body2" color="textPrimary" component="span">
                                <FormattedBalance
                                    value={BigNumber.sum(...exchange_out_volumes)}
                                    decimals={pool.token.decimals}
                                />
                            </Typography>{' '}
                            {pool.token.symbol}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="span">
                            {t('plugin_ito_list_total')}
                            <Typography variant="body2" color="textPrimary" component="span">
                                <FormattedBalance value={pool.total} decimals={pool.token.decimals} />
                            </Typography>{' '}
                            {pool.token.symbol}
                        </Typography>
                    </Box>

                    <Box className={classes.deteils}>
                        <TableContainer component={Paper} className={classes.table}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.head} align="center" size="small">
                                            {t('plugin_ito_list_table_type')}
                                        </TableCell>
                                        <TableCell className={classes.head} align="center" size="small">
                                            {t('plugin_ito_list_table_price')}
                                        </TableCell>
                                        <TableCell className={classes.head} align="center" size="small">
                                            {t('plugin_ito_list_table_sold')}
                                        </TableCell>
                                        <TableCell className={classes.head} align="center" size="small">
                                            {t('plugin_ito_list_table_got')}
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pool.exchange_tokens.map((token, index) => (
                                        <TableRow key={index}>
                                            <TableCell
                                                className={classes.cell}
                                                align="center"
                                                size="small"
                                                style={{ whiteSpace: 'nowrap' }}>
                                                {token.symbol}
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                {formatBalance(
                                                    new BigNumber(pool.exchange_amounts[index * 2])
                                                        .dividedBy(pool.exchange_amounts[index * 2 + 1])
                                                        .multipliedBy(
                                                            new BigNumber(10).pow(
                                                                pool.token.decimals -
                                                                    pool.exchange_tokens[index].decimals,
                                                            ),
                                                        )
                                                        .multipliedBy(
                                                            new BigNumber(10).pow(pool.exchange_tokens[index].decimals),
                                                        )
                                                        .integerValue(),
                                                    token.decimals,
                                                    6,
                                                )}{' '}
                                                {token.symbol} / {pool.token.symbol}
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                <FormattedBalance
                                                    value={exchange_out_volumes[index]}
                                                    decimals={pool.token.decimals}
                                                    significant={6}
                                                    symbol={pool.token.symbol}
                                                />
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                <FormattedBalance
                                                    value={exchange_in_volumes[index]}
                                                    decimals={pool.token.decimals}
                                                    significant={6}
                                                    symbol={pool.token.symbol}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            </Card>
        </div>
    )
}
