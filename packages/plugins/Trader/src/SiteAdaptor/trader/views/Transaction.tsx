import { t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { CopyButton, EmptyStatus, NetworkIcon, Spinner } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useAccount, useNetwork, useWeb3Connection } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, OKX } from '@masknet/web3-providers'
import { dividedBy, formatBalance, formatCompact, TransactionStatusType } from '@masknet/web3-shared-base'
import { type ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { alpha, Box, Button, Typography } from '@mui/material'
import { skipToken, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { memo, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'
import { formatTime } from '../../../helpers/formatTime.js'
import { CoinIcon } from '../../components/CoinIcon.js'
import { Countdown } from '../../components/Countdown.js'
import { GasCost } from '../../components/GasCost.js'
import { RoutePaths } from '../../constants.js'
import { useTransaction } from '../../storage.js'
import { useSwap } from '../contexts/index.js'
import { okxTokenToFungibleToken } from '../helpers.js'

const useStyles = makeStyles<void, 'leftSideToken' | 'rightSideToken'>()((theme, _, refs) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
        boxSizing: 'border-box',
        padding: theme.spacing(2),
        gap: theme.spacing(3),
        scrollbarWidth: 'none',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    spinner: {
        width: 60,
    },
    title: {
        lineHeight: '24px',
        fontSize: 20,
        fontWeight: 700,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
    },
    countdown: {
        fontWeight: 700,
        color: theme.palette.maskColor.success,
    },
    note: {
        fontSize: 14,
        lineHeight: '18px',
    },
    box: {
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 12,
        padding: theme.spacing(1.5),
    },
    tokens: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
    token: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
    },
    waiting: {
        opacity: '.5',
    },
    tokenTitle: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
    },
    tokenIcon: {
        height: 30,
        width: 30,
        position: 'relative',
        zIndex: 10,
    },
    leftSideToken: {},
    rightSideToken: {},
    bridgeToken: {
        marginLeft: 5,
        marginRight: 5,
        width: 20,
        height: 20,
        position: 'relative',
        '&::before': {
            content: '""',
            height: 40,
            borderLeft: `1px solid ${theme.palette.maskColor.line}`,
            position: 'absolute',
            zIndex: 1,
        },
        [`&.${refs.leftSideToken}`]: {
            '&::before': {
                bottom: 20,
                left: 10,
            },
        },
        [`&.${refs.rightSideToken}`]: {
            '&::before': {
                top: 20,
                left: 10,
            },
        },
    },
    tokenInfo: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    tokenValue: {
        display: 'flex',
        lineHeight: '18px',
        flexDirection: 'column',
        marginRight: 'auto',
    },
    rotate: {
        transform: 'rotate(180deg)',
    },
    tip: {
        fontSize: 13,
        lineHeight: '18px',
        padding: theme.spacing(0.5),
        borderRadius: theme.spacing(0.5),
        backgroundColor: theme.palette.maskColor.bottom,
    },
    value: {
        fontSize: 14,
        fontWeight: 700,
    },
    fromToken: {
        fontSize: 13,
        fontWeight: 400,
        lineHeight: '18px',
    },
    network: {
        fontSize: 13,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    toToken: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
        color: theme.palette.maskColor.success,
        display: 'flex',
        alignItems: 'center',
    },
    infoList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    infoRow: {
        display: 'flex',
        width: '100%',
        alignItems: 'flex-start',
        color: theme.palette.maskColor.main,
        justifyContent: 'space-between',
    },
    rowName: {
        fontSize: 14,
        display: 'flex',
        gap: theme.spacing(0.5),
        color: theme.palette.maskColor.second,
        alignItems: 'center',
        flexGrow: 1,
        marginRight: 'auto',
    },
    rowValue: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '18px',
        gap: theme.spacing(0.5),
        fontSize: 14,
    },
    footer: {
        flexShrink: 0,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
        boxSizing: 'content-box',
        display: 'flex',
        backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
        backdropFilter: 'blur(16px)',
        padding: theme.spacing(2),
        borderRadius: '0 0 12px 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        maxHeight: 40,
        color: theme.palette.maskColor.bottom,
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    toChainIcon: {
        borderRadius: '50%',
        marginLeft: -8,
        marginRight: theme.spacing(1),
        boxShadow: `0 0 0 1px ${theme.palette.maskColor.bottom}`,
    },
}))

export const Transaction = memo(function Transaction() {
    const { reset, setFromToken, mode, setMode, setToToken } = useSwap()
    const { classes, cx, theme } = useStyles()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const hash = params.get('hash')
    const rawChainId = params.get('chainId')
    const chainId = rawChainId ? +rawChainId : undefined
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const tx = useTransaction(account, hash)
    const { fromToken, toToken, fromTokenAmount, toTokenAmount } = tx || {}
    const fromChainId = fromToken?.chainId as ChainId
    const toChainId = toToken?.chainId as ChainId
    const fromNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, fromChainId)
    const toNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, toToken?.chainId)

    const [forwardCompare, setForwardCompare] = useState(true)

    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: fromChainId })
    const { data: status } = useQuery({
        queryKey: ['transaction-status', chainId, hash],
        queryFn: hash ? () => Web3.getTransactionStatus(hash) : skipToken,
        refetchInterval: 5_000,
    })

    const { data: bridgeStatus } = useQuery({
        queryKey: ['okx-bridge', 'transaction-status', chainId, hash],
        queryFn: hash && tx?.kind === 'bridge' ? () => OKX.getBridgeStatus({ chainId, hash }) : skipToken,
        refetchInterval: 60_000,
    })
    const detailStatus = bridgeStatus?.detailStatus

    const isSwap = tx?.kind === 'swap'
    const txUrl = useMemo(() => {
        if (isSwap) {
            return chainId && hash ? EVMExplorerResolver.transactionLink(chainId, hash) : undefined
        }
        if (!toChainId || !bridgeStatus?.toTxHash) return undefined
        return EVMExplorerResolver.transactionLink(toChainId, bridgeStatus.toTxHash)
    }, [isSwap, chainId, hash, toChainId, bridgeStatus?.toTxHash])

    const txPending = status === TransactionStatusType.NOT_DEPEND
    const [expand = txPending, setExpand] = useState<boolean>()

    if (!tx)
        return (
            <Box className={classes.container} alignItems="center" justifyContent="center">
                <EmptyStatus />
            </Box>
        )
    const expandable = tx.kind === 'bridge' && !!(tx.leftSideToken || tx.rightSideToken)

    const txSucceed = status === TransactionStatusType.SUCCEED
    const txFailed = status === TransactionStatusType.FAILED

    const [baseToken, targetToken] = forwardCompare ? [tx.fromToken, tx.toToken] : [tx.toToken, tx.fromToken]
    const rate =
        forwardCompare && tx ?
            dividedBy(tx.toTokenAmount!, tx.fromTokenAmount ?? '1')
        :   dividedBy(tx.fromTokenAmount!, tx.toTokenAmount!)

    const rateNode =
        baseToken && targetToken ?
            <>
                1 {baseToken.symbol} ≈ {rate ? formatCompact(rate.toNumber(), { maximumFractionDigits: 6 }) : '--'}{' '}
                {targetToken.symbol}
                <Icons.Cached
                    size={16}
                    color={theme.palette.maskColor.main}
                    onClick={() => setForwardCompare((v) => !v)}
                />
            </>
        :   null

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                {txPending || bridgeStatus?.status === 'PENDING' ?
                    <>
                        <div className={classes.header}>
                            <Spinner className={classes.spinner} variant="loading" />
                            <Typography className={classes.title}>
                                {tx.kind === 'swap' ? t`Swapping` : t`Bridging`}
                            </Typography>
                            <Typography component="div" className={classes.subtitle}>
                                <Trans>
                                    Your transaction should be done in{' '}
                                    <Countdown
                                        className={classes.countdown}
                                        component="span"
                                        endtime={tx.timestamp + tx.estimatedTime * 1000}
                                    />
                                </Trans>
                            </Typography>
                        </div>
                        <Typography className={cx(classes.box, classes.note)}>
                            <Trans>
                                The {isSwap ? 'swap' : 'bridge'} is in progress. You can check its status in History
                                after exiting this page.
                            </Trans>
                        </Typography>
                    </>
                : txSucceed || bridgeStatus?.status === 'SUCCESS' ?
                    <div className={classes.header}>
                        <Icons.FillSuccess size={72} />
                        <Typography className={classes.title} color={theme.palette.maskColor.success}>
                            <Trans>Complete</Trans>
                        </Typography>
                    </div>
                :   <div className={classes.header}>
                        <Icons.ColorfulClose color={theme.palette.maskColor.danger} size={72} />
                        <Typography className={classes.title} color={theme.palette.maskColor.danger}>
                            <Trans>Failed</Trans>
                        </Typography>
                    </div>
                }
                <div className={cx(classes.box, classes.tokens)}>
                    <div className={classes.token}>
                        <Typography className={classes.tokenTitle}>
                            <Trans>From</Trans>
                        </Typography>
                        <div className={classes.tokenInfo}>
                            <CoinIcon
                                className={classes.tokenIcon}
                                chainId={fromChainId}
                                address={fromToken?.contractAddress || ''}
                            />
                            <div className={classes.tokenValue}>
                                <Typography className={cx(classes.fromToken, classes.value)}>
                                    {txPending ?
                                        <LoadingBase size={16} />
                                    : fromTokenAmount && fromToken ?
                                        `-${formatBalance(fromTokenAmount, fromToken.decimals)} ${fromToken.symbol}`
                                    :   '--'}
                                </Typography>
                                <Typography className={classes.network}>{fromNetwork?.name ?? '--'}</Typography>
                                {txPending || detailStatus === 'BRIDGE_PENDING' ?
                                    <Typography className={classes.tip}>
                                        <Trans>Transaction in progress. Thank you for your patience.</Trans>
                                    </Typography>
                                :   null}
                            </div>
                            {expandable ?
                                <Icons.ArrowDrop
                                    className={expand ? classes.rotate : undefined}
                                    size={24}
                                    onClick={() => setExpand((v) => !v)}
                                />
                            :   null}
                        </div>
                        {tx.kind === 'bridge' && tx.leftSideToken && expand ?
                            <div className={classes.tokenInfo}>
                                <CoinIcon
                                    className={cx(classes.bridgeToken, classes.leftSideToken)}
                                    chainId={fromChainId}
                                    address={tx.leftSideToken.tokenContractAddress}
                                    tokenIconSize={20}
                                    disableBadge
                                />
                                <div className={classes.tokenValue}>
                                    <Typography className={cx(classes.fromToken, classes.value)}>
                                        {txPending ?
                                            <LoadingBase size={16} />
                                        :   `-- ${tx.leftSideToken.tokenSymbol}`}
                                    </Typography>
                                    <Typography className={classes.network}>{fromNetwork?.name ?? '--'}</Typography>
                                </div>
                                {bridgeStatus?.fromTxHash ?
                                    <a
                                        href={EVMExplorerResolver.transactionLink(fromChainId, bridgeStatus.fromTxHash)}
                                        target="_blank">
                                        <Icons.LinkOut color={theme.palette.maskColor.second} size={16} />
                                    </a>
                                :   null}
                            </div>
                        :   null}
                    </div>
                    <div
                        className={cx(
                            classes.token,
                            tx.kind === 'bridge' && ['BRIDGE_PENDING', 'WAITING'].includes(detailStatus!) ?
                                classes.waiting
                            :   undefined,
                        )}>
                        <Typography className={classes.tokenTitle}>
                            <Trans>To</Trans>
                        </Typography>
                        {tx.kind === 'bridge' && tx.rightSideToken && expand ?
                            <div className={classes.tokenInfo}>
                                <CoinIcon
                                    className={cx(classes.bridgeToken, classes.rightSideToken)}
                                    chainId={toChainId}
                                    address={tx.rightSideToken.tokenContractAddress}
                                    tokenIconSize={20}
                                    disableBadge
                                />
                                <div className={classes.tokenValue}>
                                    <Typography className={cx(classes.toToken, classes.value)}>
                                        {`-- ${tx.rightSideToken.tokenSymbol}`}
                                    </Typography>
                                    <Typography className={classes.network}>{toNetwork?.name ?? '--'}</Typography>
                                    {txPending || detailStatus === 'BRIDGE_PENDING' ?
                                        <Typography className={classes.tip}>
                                            <Trans>Transaction in progress. Thank you for your patience.</Trans>
                                        </Typography>
                                    :   null}
                                </div>
                                {bridgeStatus?.bridgeHash ?
                                    <a
                                        href={EVMExplorerResolver.transactionLink(toChainId, bridgeStatus.bridgeHash)}
                                        target="_blank">
                                        <Icons.LinkOut color={theme.palette.maskColor.second} size={16} />
                                    </a>
                                :   null}
                            </div>
                        :   null}
                        <div className={classes.tokenInfo}>
                            <CoinIcon
                                className={classes.tokenIcon}
                                chainId={toToken?.chainId}
                                address={toToken?.contractAddress || ''}
                            />
                            <div className={classes.tokenValue}>
                                <Typography className={cx(classes.toToken, classes.value)} alignItems="center">
                                    {detailStatus === 'BRIDGE_PENDING' ?
                                        <LoadingBase size={16} />
                                    :   null}
                                    {toTokenAmount && toToken ?
                                        `+${formatBalance(toTokenAmount, toToken.decimals)} ${toToken.symbol}`
                                    :   '--'}
                                </Typography>
                                <Typography className={classes.network}>{toNetwork?.name ?? '--'}</Typography>
                            </div>
                            {txUrl ?
                                <a href={txUrl} target="_blank">
                                    <Icons.LinkOut color={theme.palette.maskColor.second} size={16} />
                                </a>
                            :   null}
                        </div>
                    </div>
                </div>
                <div className={classes.infoList}>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Transaction type</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>{tx.kind === 'swap' ? t`Swap` : t`Bridge`}</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Date</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            {tx.timestamp ? format(tx.timestamp, 'MM/dd/yyyy, hh:mm:ss') : '--'}
                        </Typography>
                    </div>
                    {isSwap ? null : (
                        <div className={classes.infoRow}>
                            <Typography className={classes.rowName}>
                                <Trans>Swap duration</Trans>
                            </Typography>
                            <Typography className={classes.rowValue}>{formatTime(tx.estimatedTime)}</Typography>
                        </div>
                    )}
                    {mode === 'swap' ?
                        <div className={classes.infoRow}>
                            <Typography className={classes.rowName}>
                                <Trans>Network</Trans>
                            </Typography>
                            <Typography className={classes.rowValue} style={{ gap: 8 }}>
                                <NetworkIcon size={16} pluginID={NetworkPluginID.PLUGIN_EVM} chainId={fromChainId} />
                                {fromNetwork?.name}
                            </Typography>
                        </div>
                    :   <div className={classes.infoRow}>
                            <Typography className={classes.rowName}>
                                <Trans>Network</Trans>
                            </Typography>
                            <Typography className={classes.rowValue}>
                                <NetworkIcon pluginID={NetworkPluginID.PLUGIN_EVM} chainId={fromChainId} size={16} />
                                <NetworkIcon
                                    className={classes.toChainIcon}
                                    pluginID={NetworkPluginID.PLUGIN_EVM}
                                    chainId={toChainId}
                                    size={16}
                                />
                                <Trans>
                                    {fromNetwork?.name || '--'} to {toNetwork?.name || '--'}
                                </Trans>
                            </Typography>
                        </div>
                    }
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>Network fee</Typography>
                        <GasCost
                            className={classes.rowValue}
                            chainId={fromChainId}
                            gasLimit={tx.transactionFee}
                            gasPrice={tx.gasPrice}
                        />
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Rate</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>{rateNode}</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Sending address</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            {formatEthereumAddress(tx.dexContractAddress, 4)}
                            <CopyButton text={tx.dexContractAddress} size={16} display="flex" />
                        </Typography>
                    </div>
                </div>
            </div>
            {txSucceed || txFailed ?
                <div className={classes.footer}>
                    <Button
                        className={classes.button}
                        fullWidth
                        onClick={() => {
                            if (txSucceed) reset()
                            setMode(tx.kind)
                            setFromToken(okxTokenToFungibleToken(tx.fromToken))
                            setToToken(okxTokenToFungibleToken(tx.toToken))
                            navigate(urlcat(RoutePaths.Trade, { mode: tx.kind }))
                        }}>
                        <Icons.Cached color={theme.palette.maskColor.bottom} />
                        {txSucceed ?
                            isSwap ?
                                <Trans>Make another Swap</Trans>
                            :   <Trans>Make another Bridge</Trans>
                        :   <Trans>Try Again</Trans>}
                    </Button>
                </div>
            : txUrl ?
                <div className={classes.footer}>
                    <Button
                        className={classes.button}
                        fullWidth
                        onClick={() => {
                            window.open(txUrl)
                        }}>
                        <Icons.Connect />
                        <Trans>Check on Explorer</Trans>
                    </Button>
                </div>
            :   null}
        </div>
    )
})
