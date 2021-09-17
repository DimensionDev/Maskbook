import { FormattedBalance } from '@masknet/shared'
import {
    formatBalance,
    isZero,
    pow10,
    getChainDetailed,
    isSameAddress,
    useAccount,
    FungibleToken,
    useTokenConstants,
    TransactionStateType,
    useFungibleTokenDetailed,
    useFungibleTokensDetailed,
    EthereumTokenType,
} from '@masknet/web3-shared'
import {
    Box,
    Card,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import formatDateTime from 'date-fns/format'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenIcon } from '@masknet/shared'
import { debugModeSetting } from '../../../settings/settings'
import { useI18N } from '../../../utils'
import { MSG_DELIMITER } from '../constants'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed'
import { usePoolTradeInfo } from './hooks/usePoolTradeInfo'
import { ITO_Status, JSON_PayloadInMask, PoolFromNetwork, JSON_PayloadFromChain } from '../types'
import { useDestructCallback } from './hooks/useDestructCallback'
import { useTransactionDialog } from '../../../web3/hooks/useTransactionDialog'
import { omit } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
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
    details: {
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

export interface PoolInListProps extends PoolFromNetwork {
    onSend?: (pool: JSON_PayloadInMask) => void
    onRetry: () => void
}

export function PoolInList(props: PoolInListProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { pool, exchange_in_volumes, exchange_out_volumes, onSend, onRetry } = props
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    //#region Fetch tokens detailed
    const { value: _tokenDetailed } = useFungibleTokenDetailed(
        EthereumTokenType.ERC20,
        (pool as JSON_PayloadFromChain).token_address ?? (pool as JSON_PayloadInMask).token.address,
    )
    const poolToken = (pool as JSON_PayloadInMask).token ?? _tokenDetailed
    const { exchange_token_addresses } = pool as JSON_PayloadFromChain
    const _poolTokens = exchange_token_addresses
        ? exchange_token_addresses.map(
              (v) =>
                  ({
                      address: v,
                      type: isSameAddress(v, NATIVE_TOKEN_ADDRESS) ? EthereumTokenType.Native : EthereumTokenType.ERC20,
                  } as Pick<FungibleToken, 'address' | 'type'>),
          )
        : []

    const { value: _exchangeTokens } = useFungibleTokensDetailed(_poolTokens)
    const exchangeTokens = (pool as JSON_PayloadInMask).exchange_tokens ?? _exchangeTokens
    //#endregion

    //#region Calculate out exchange_out_volumes
    const exchangeOutVolumes =
        exchange_out_volumes.length === exchange_in_volumes.length
            ? exchange_out_volumes
            : poolToken && exchangeTokens
            ? exchange_in_volumes.map((v, i) =>
                  new BigNumber(v).div(pool.exchange_amounts[i * 2]).times(pool.exchange_amounts[i * 2 + 1]),
              )
            : []
    //#endregion

    //#region withdraw
    const [destructState, destructCallback, resetDestructCallback] = useDestructCallback(pool.contract_address)
    useTransactionDialog(null, destructState, TransactionStateType.CONFIRMED, () => {
        onRetry()
        resetDestructCallback()
    })
    //#endregion

    const account = useAccount()
    const { computed: availabilityComputed, loading: loadingAvailability } = useAvailabilityComputed(pool)
    const { value: tradeInfo, loading: loadingTradeInfo } = usePoolTradeInfo(pool.pid, account)
    const title = pool.message.split(MSG_DELIMITER)[1] ?? pool.message
    const noRemain = isZero(pool.total_remaining)
    const { listOfStatus } = availabilityComputed

    const isWithdrawn = tradeInfo?.destructInfo

    const canWithdraw = !isWithdrawn && (listOfStatus.includes(ITO_Status.expired) || noRemain)

    // Note: After upgrade to Asymmetrical secret key in the future, `canSend` requires `password` exists.
    const canSend = !listOfStatus.includes(ITO_Status.expired) && !noRemain
    const base = new BigNumber(pool.total).minus(pool.total_remaining).dividedBy(pool.total).toNumber()
    const progress = 100 * base

    const StatusButton = () => {
        return (
            <>
                {loadingTradeInfo || loadingAvailability ? null : canWithdraw ? (
                    <ActionButton size="small" variant="contained" onClick={() => destructCallback(pool.pid)}>
                        {t('plugin_ito_withdraw')}
                    </ActionButton>
                ) : canSend ? (
                    <ActionButton
                        size="small"
                        variant="contained"
                        onClick={() =>
                            onSend?.(
                                omit({ ...pool, token: poolToken, exchange_tokens: exchangeTokens }, [
                                    'token_addresses',
                                    'exchange_token_addresses',
                                ]) as JSON_PayloadInMask,
                            )
                        }>
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

    return poolToken && exchangeTokens ? (
        <div className={classes.top}>
            <Card className={classes.root} variant="outlined">
                <Box className={classes.iconbar}>
                    <TokenIcon
                        classes={{ icon: classes.icon }}
                        address={poolToken.address}
                        logoURI={poolToken.logoURI}
                    />
                </Box>
                <Box className={classes.content}>
                    <Box className={classes.header}>
                        <Box className={classes.title}>
                            <Typography variant="body1" color="textPrimary">
                                {title}
                            </Typography>
                            <Typography className={classes.date} variant="body2" color="textSecondary">
                                {t('plugin_ito_list_start_date', {
                                    date: formatDateTime(pool.start_time, 'yyyy-MM-dd HH:mm:ss'),
                                })}
                            </Typography>
                            <Typography className={classes.date} variant="body2" color="textSecondary">
                                {t('plugin_ito_list_end_date', {
                                    date: formatDateTime(pool.end_time, 'yyyy-MM-dd HH:mm:ss'),
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
                                    value={BigNumber.sum(...exchangeOutVolumes)}
                                    decimals={poolToken.decimals}
                                />
                            </Typography>{' '}
                            {poolToken.symbol}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="span">
                            {t('plugin_ito_list_total')}
                            <Typography variant="body2" color="textPrimary" component="span">
                                <FormattedBalance value={pool.total} decimals={poolToken.decimals} />
                            </Typography>{' '}
                            {poolToken.symbol}
                        </Typography>
                    </Box>

                    <Box className={classes.details}>
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
                                    {exchangeTokens.map((token, index) => (
                                        <TableRow key={index}>
                                            <TableCell
                                                className={classes.cell}
                                                align="center"
                                                size="small"
                                                style={{ whiteSpace: 'nowrap' }}>
                                                {isSameAddress(token.address, NATIVE_TOKEN_ADDRESS)
                                                    ? getChainDetailed(token.chainId)?.nativeCurrency.symbol
                                                    : token.symbol}
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                {formatBalance(
                                                    new BigNumber(pool.exchange_amounts[index * 2])
                                                        .dividedBy(pool.exchange_amounts[index * 2 + 1])
                                                        .multipliedBy(
                                                            pow10(poolToken.decimals - exchangeTokens[index].decimals),
                                                        )
                                                        .multipliedBy(pow10(exchangeTokens[index].decimals))
                                                        .integerValue(),
                                                    token.decimals,
                                                    6,
                                                )}{' '}
                                                {isSameAddress(token.address, NATIVE_TOKEN_ADDRESS)
                                                    ? getChainDetailed(token.chainId)?.nativeCurrency.symbol
                                                    : token.symbol}{' '}
                                                / {poolToken.symbol}
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                <FormattedBalance
                                                    value={exchangeOutVolumes[index]}
                                                    decimals={poolToken.decimals}
                                                    significant={6}
                                                    symbol={poolToken.symbol}
                                                />
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                <FormattedBalance
                                                    value={exchange_in_volumes[index]}
                                                    decimals={token.decimals}
                                                    significant={6}
                                                    symbol={token.symbol}
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
    ) : null
}
