import { FormattedBalance, TokenIcon } from '@masknet/shared'
import { SchemaType, useTokenConstants, chainResolver, ChainId } from '@masknet/web3-shared-evm'
import {
    isZero,
    formatBalance,
    NetworkPluginID,
    isSameAddress,
    FungibleToken,
    TokenType,
} from '@masknet/web3-shared-base'
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
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import formatDateTime from 'date-fns/format'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { MSG_DELIMITER } from '../constants'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed'
import { usePoolTradeInfo } from './hooks/usePoolTradeInfo'
import { ITO_Status, JSON_PayloadFromChain, JSON_PayloadInMask, PoolFromNetwork } from '../types'
import { useDestructCallback } from './hooks/useDestructCallback'
import { omit } from 'lodash-unified'
import { useSubscription } from 'use-subscription'
import { PersistentStorages } from '../../../../shared'
import { useAccount, useFungibleToken, useFungibleTokens } from '@masknet/plugin-infra/web3'
import { useCallback } from 'react'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        top: {
            width: '100%',
            boxSizing: 'border-box',
            padding: theme.spacing(1, 2, 1),
            [smallQuery]: {
                padding: theme.spacing(1, 0, 1),
            },
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
            overflowX: 'hidden',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            paddingBottom: theme.spacing(1),
            [smallQuery]: {
                flexDirection: 'column',
            },
        },
        button: {
            borderRadius: 50,
            [smallQuery]: {
                width: '100%',
            },
        },
        title: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: theme.spacing(1),
            width: '100%',
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
            padding: theme.spacing(0, 0, 1, 0),
            borderRadius: 0,
        },
        cell: {
            border: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
            wordBreak: 'break-word',
        },
        head: {
            border: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.secondary,
        },
        ellipsis: {
            maxWidth: 350,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
    }
})

export interface PoolInListProps extends PoolFromNetwork {
    onSend?: (pool: JSON_PayloadInMask) => void
    onRetry: () => void
}

export function PoolInList(props: PoolInListProps) {
    const { pool, exchange_in_volumes, exchange_out_volumes, onSend, onRetry } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const isDebugging = useSubscription(PersistentStorages.Settings.storage.debugging.subscription)
    // #region Fetch tokens detailed
    const { value: _tokenDetailed } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        (pool as JSON_PayloadFromChain).token_address ?? (pool as JSON_PayloadInMask).token.address,
    )
    const poolToken = (pool as JSON_PayloadInMask).token ?? _tokenDetailed
    const { exchange_token_addresses } = pool as JSON_PayloadFromChain
    const _poolTokens = exchange_token_addresses
        ? exchange_token_addresses.map(
              (v) =>
                  ({
                      address: v,
                      schema: isSameAddress(v, NATIVE_TOKEN_ADDRESS) ? SchemaType.Native : SchemaType.ERC20,
                      type: TokenType.Fungible,
                  } as Pick<
                      FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>,
                      'address' | 'type' | 'schema'
                  >),
          )
        : []

    const { value: _exchangeTokens } = useFungibleTokens(
        NetworkPluginID.PLUGIN_EVM,
        _poolTokens.map((x) => x.address),
    )
    const exchangeTokens = (pool as JSON_PayloadInMask).exchange_tokens ?? _exchangeTokens
    // #endregion

    // #region Calculate out exchange_out_volumes
    const exchangeOutVolumes =
        exchange_out_volumes.length === exchange_in_volumes.length
            ? exchange_out_volumes
            : poolToken && exchangeTokens
            ? exchange_in_volumes.map((v, i) =>
                  new BigNumber(v).div(pool.exchange_amounts[i * 2]).times(pool.exchange_amounts[i * 2 + 1]),
              )
            : []
    // #endregion

    // #region withdraw
    const [{ loading: destructing }, destructCallback] = useDestructCallback(pool.contract_address)
    const destruct = useCallback(
        async (pid: string) => {
            await destructCallback(pid)
            onRetry()
        },
        [destructCallback, onRetry],
    )
    // #endregion

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
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
                    <ActionButton
                        loading={destructing}
                        disabled={destructing}
                        fullWidth
                        size="small"
                        variant="contained"
                        onClick={() => destructCallback(pool.pid)}>
                        {t('plugin_ito_withdraw')}
                    </ActionButton>
                ) : canSend ? (
                    <ActionButton
                        fullWidth
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
                    <ActionButton fullWidth size="small" variant="contained" disabled>
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
                        name={poolToken.symbol}
                        logoURI={poolToken.logoURL}
                    />
                </Box>
                <Box className={classes.content}>
                    <Box className={classes.header}>
                        <Box className={classes.title}>
                            <Typography variant="body1" color="textPrimary" className={classes.ellipsis}>
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
                            {isDebugging ? (
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
                                    formatter={formatBalance}
                                />
                            </Typography>{' '}
                            {poolToken.symbol}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="span">
                            {t('plugin_ito_list_total')}
                            <Typography variant="body2" color="textPrimary" component="span">
                                <FormattedBalance
                                    value={pool.total}
                                    decimals={poolToken.decimals}
                                    formatter={formatBalance}
                                />
                            </Typography>{' '}
                            {poolToken.symbol}
                        </Typography>
                    </Box>

                    <Box className={classes.details}>
                        <TableContainer component={Paper} className={classes.table}>
                            <Table size="small" stickyHeader>
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
                                                    ? chainResolver.nativeCurrency(token.chainId)?.symbol
                                                    : token.symbol}
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                {formatBalance(
                                                    new BigNumber(pool.exchange_amounts[index * 2])
                                                        .dividedBy(pool.exchange_amounts[index * 2 + 1])
                                                        .shiftedBy(poolToken.decimals - exchangeTokens[index].decimals)
                                                        .shiftedBy(exchangeTokens[index].decimals)
                                                        .integerValue(),
                                                    token.decimals,
                                                    6,
                                                )}{' '}
                                                {isSameAddress(token.address, NATIVE_TOKEN_ADDRESS)
                                                    ? chainResolver.nativeCurrency(token.chainId)?.symbol
                                                    : token.symbol}{' '}
                                                / {poolToken.symbol}
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                <FormattedBalance
                                                    value={exchangeOutVolumes[index]}
                                                    decimals={poolToken.decimals}
                                                    significant={6}
                                                    symbol={poolToken.symbol}
                                                    formatter={formatBalance}
                                                />
                                            </TableCell>
                                            <TableCell className={classes.cell} align="center" size="small">
                                                <FormattedBalance
                                                    value={exchange_in_volumes[index]}
                                                    decimals={token.decimals}
                                                    significant={6}
                                                    symbol={token.symbol}
                                                    formatter={formatBalance}
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
