import { Select, t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { CopyButton, LoadingStatus, NetworkIcon, PluginWalletStatusBar, ProgressiveText } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, LoadingBase, makeStyles, ShadowRootTooltip, useCustomSnackbar } from '@masknet/theme'
import { useAccount, useNativeTokenPrice, useNetwork, useWeb3Connection, useWeb3Utils } from '@masknet/web3-hooks-base'
import {
    dividedBy,
    formatBalance,
    formatCompact,
    GasOptionType,
    leftShift,
    multipliedBy,
    rightShift,
} from '@masknet/web3-shared-base'
import { type ChainId, formatWeiToEther } from '@masknet/web3-shared-evm'
import { Box, Link as MuiLink, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import { memo, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import urlcat from 'urlcat'
import { CoinIcon } from '../../components/CoinIcon.js'
import { Warning } from '../../components/Warning.js'
import { DEFAULT_SLIPPAGE, RoutePaths } from '../../constants.js'
import { addTransaction } from '../../storage.js'
import { useGasManagement, useTrade } from '../contexts/index.js'
import { getBridgeLeftSideToken, getBridgeRightSideToken } from '../helpers.js'
import { useApprove } from '../hooks/useApprove.js'
import { useBridgable } from '../hooks/useBridgable.js'
import { useBridgeData } from '../hooks/useBridgeData.js'
import { useLeave } from '../hooks/useLeave.js'
import { useToken } from '../hooks/useToken.js'
import { useTokenPrice } from '../hooks/useTokenPrice.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        boxSizing: 'border-box',
        padding: theme.spacing(2),
        scrollbarWidth: 'none',
        gap: theme.spacing(1.5),
    },
    pair: {
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 12,
        padding: theme.spacing(1.5),
    },
    token: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
    },
    tokenTitle: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
    },
    tokenIcon: {
        height: 30,
        width: 30,
    },
    tokenInfo: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    tokenValue: {
        display: 'flex',
        lineHeight: '18px',
        flexDirection: 'column',
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
        textTransform: 'capitalize',
    },
    rowValue: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '18px',
        gap: theme.spacing(0.5),
        fontSize: 14,
    },
    toChainIcon: {
        borderRadius: '50%',
        marginLeft: -8,
        marginRight: theme.spacing(1),
        boxShadow: `0 0 0 1px ${theme.palette.maskColor.bottom}`,
    },
    link: {
        cursor: 'pointer',
        textDecoration: 'none',
        textAlign: 'right',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    text: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    rotate: {
        transform: 'rotate(180deg)',
    },
    data: {
        wordBreak: 'break-all',
        fontFamily: 'monospace',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        maxHeight: 60,
        overflow: 'auto',
        scrollbarWidth: 'none',
    },
    footer: {
        flexShrink: 0,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
}))

export const BridgeConfirm = memo(function BridgeConfirm() {
    const { classes, cx, theme } = useStyles()
    const navigate = useNavigate()
    const {
        mode,
        inputAmount,
        fromToken,
        toToken,
        isAutoSlippage,
        slippage,
        bridgeQuote: quote,
        isQuoteStale,
        updateQuote,
    } = useTrade()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const fromChainId = fromToken?.chainId as ChainId
    const toChainId = toToken?.chainId as ChainId
    const fromNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, fromChainId)
    const toNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, toChainId)
    const decimals = fromToken?.decimals
    const amount = useMemo(
        () => (inputAmount && decimals ? rightShift(inputAmount, decimals).toFixed(0) : ''),
        [inputAmount, decimals],
    )
    const { data: bridgeData, isLoading } = useBridgeData({
        fromChainId,
        toChainId,
        amount,
        fromTokenAddress: fromToken?.address,
        toTokenAddress: toToken?.address,
        slippage: new BigNumber(isAutoSlippage || !slippage ? DEFAULT_SLIPPAGE : slippage).div(100).toFixed(),
        userWalletAddress: account,
    })
    const { gasFee, gasCost, gasLimit, gasConfig } = useGasManagement()
    const gasOptionType = gasConfig.gasOptionType ?? GasOptionType.NORMAL
    const [expand, setExpand] = useState(false)
    const firstData = bridgeData?.data?.[0]
    const transaction = firstData?.tx
    const fromTokenAmount = firstData?.fromTokenAmount
    const toTokenAmount = firstData?.toTokenAmount

    const [forwardCompare, setForwardCompare] = useState(true)
    const [baseToken, targetToken] =
        forwardCompare ? [quote?.fromToken, quote?.toToken] : [quote?.toToken, quote?.fromToken]

    const rate = useMemo(() => {
        if (!quote) return null
        const { fromTokenAmount, toTokenAmount, fromToken, toToken } = quote
        const fromAmount = leftShift(fromTokenAmount || 0, fromToken.decimals)
        const toAmount = leftShift(toTokenAmount || 0, toToken.decimals)
        if (fromAmount.isZero() || toAmount.isZero()) return null
        return forwardCompare ? dividedBy(toAmount, fromAmount) : dividedBy(fromAmount, toAmount)
    }, [quote])

    const rateNode =
        baseToken && targetToken && rate ?
            <>
                1 {baseToken.tokenSymbol} ≈ {rate ? formatCompact(rate.toNumber(), { maximumFractionDigits: 6 }) : '--'}{' '}
                {targetToken.tokenSymbol}
                <Icons.Cached
                    size={16}
                    color={theme.palette.maskColor.main}
                    onClick={() => setForwardCompare((v) => !v)}
                />
            </>
        :   null

    const Utils = useWeb3Utils(NetworkPluginID.PLUGIN_EVM)
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: fromChainId })
    const gas = gasConfig.gas ?? transaction?.gasLimit ?? gasLimit
    const [{ loading: isSending }, sendBridge] = useAsyncFn(async () => {
        if (!transaction?.data) return
        return Web3.sendTransaction({
            data: transaction.data,
            to: transaction.to,
            from: account,
            value: transaction.value,
            gasPrice: gasConfig.gasPrice ?? transaction.gasPrice,
            gas: gas ? multipliedBy(gas, 1.2).toFixed(0) : gas,
            maxPriorityFeePerGas:
                'maxPriorityFeePerGas' in gasConfig && gasConfig.maxFeePerGas ?
                    gasConfig.maxFeePerGas
                :   transaction.maxPriorityFeePerGas,
            _disableSnackbar: true,
        })
    }, [transaction, account, gasConfig, Web3, gas])

    const [isBridgable, errorMessage] = useBridgable()

    const [{ isLoadingApproveInfo, isLoadingSpender, isLoadingAllowance, spender }, approveMutation] = useApprove()

    const isApproving = approveMutation.isPending
    const isCheckingApprove = isLoadingApproveInfo || isLoadingSpender || isLoadingAllowance

    const { showSnackbar } = useCustomSnackbar()
    const { data: toChainNativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: toChainId,
    })
    const toChainNetworkFee = quote?.routerList[0]?.toChainNetworkFee
    const toNetworkFeeValue = leftShift(toChainNetworkFee ?? 0, toNetwork?.nativeCurrency.decimals ?? 0)
        .times(toChainNativeTokenPrice ?? 0)
        .toFixed(2)
    const bridge = quote?.routerList[0]

    const router = bridge?.router
    const bridgeFee = router?.crossChainFee
    const bridgeFeeToken = useToken(fromChainId, router?.crossChainFeeTokenAddress)
    const { data: bridgeFeeTokenPrice } = useTokenPrice(fromChainId, router?.crossChainFeeTokenAddress)
    const bridgeFeeValue = multipliedBy(bridgeFee ?? 0, bridgeFeeTokenPrice ?? 0).toFixed(2)

    const showStale = isQuoteStale && !isSending && !isApproving

    const leaveRef = useLeave()
    const queryClient = useQueryClient()

    const [{ loading: submitting }, submit] = useAsyncFn(async () => {
        if (!fromToken || !toToken || !transaction?.to || !spender || !bridge) return

        await approveMutation.mutateAsync()
        try {
            const hash = await sendBridge().catch((err) => {
                const message = (err as Error).message
                if (message.includes('Transaction was rejected!')) return null
                throw err
            })

            if (!hash) {
                showSnackbar(t`Bridge`, {
                    message: t`Transaction rejected`,
                    variant: 'error',
                })
                return
            }
            queryClient.invalidateQueries({ queryKey: ['fungible-token', 'balance'] })
            showSnackbar(t`Bridge`, {
                message: (
                    <MuiLink
                        sx={{ wordBreak: 'break-word' }}
                        className={classes.link}
                        color="inherit"
                        href={Utils.explorerResolver.transactionLink(fromChainId, hash)}
                        tabIndex={-1}
                        target="_blank"
                        rel="noopener noreferrer">
                        {t`Transaction submitted.`}
                        <Icons.LinkOut size={16} sx={{ ml: 0.5 }} />
                    </MuiLink>
                ),
                variant: 'default',
                processing: true,
            })
            await addTransaction(account, {
                kind: 'bridge',
                hash,
                fromChainId,
                toChainId,
                fromToken: {
                    chainId: fromChainId,
                    decimals: +fromToken.decimals,
                    contractAddress: fromToken.address,
                    symbol: fromToken.symbol,
                    logo: fromToken.logoURL,
                },
                fromTokenAmount,
                toToken: {
                    chainId: toChainId,
                    decimals: +toToken.decimals,
                    contractAddress: toToken.address,
                    symbol: toToken.symbol,
                    logo: toToken.logoURL,
                },
                toTokenAmount,
                timestamp: Date.now(),
                transactionFee: gasFee.toFixed(0),
                dexContractAddress: spender,
                to: transaction.to,
                estimatedTime: bridge?.estimateTime ? +bridge.estimateTime : 0,
                gasLimit: gas!,
                gasPrice: gasConfig.gasPrice || '0',
                leftSideToken: getBridgeLeftSideToken(bridge),
                rightSideToken: getBridgeRightSideToken(bridge),
                bridgeId: router?.bridgeId,
                bridgeName: router?.bridgeName,
            })
            if (leaveRef.current) return
            const url = urlcat(RoutePaths.Transaction, {
                hash,
                chainId: fromChainId,
                mode,
                pending: true,
            })
            navigate(url, { replace: true })
        } catch (err) {
            showSnackbar(t`Bridge`, {
                message: (err as Error).message,
                variant: 'error',
            })
        }
    }, [
        fromToken,
        toToken,
        fromTokenAmount,
        toTokenAmount,
        transaction,
        spender,
        bridge,
        sendBridge,
        showSnackbar,
        fromChainId,
        toChainId,
        gasFee,
        gasConfig.gasPrice,
        router,
        mode,
    ])

    const loading = isSending || isCheckingApprove || isApproving || submitting
    const disabled = !isBridgable || loading
    return (
        <div className={classes.container}>
            <div className={classes.content}>
                {bridgeData ?
                    <div className={classes.pair}>
                        <div className={classes.token}>
                            <Typography className={classes.tokenTitle}>
                                <Trans>From</Trans>
                            </Typography>
                            <div className={classes.tokenInfo}>
                                <CoinIcon
                                    className={classes.tokenIcon}
                                    chainId={fromChainId}
                                    address={fromToken?.address || ''}
                                    disableBadge
                                />
                                <div className={classes.tokenValue}>
                                    <ProgressiveText
                                        loading={!fromToken}
                                        className={cx(classes.fromToken, classes.value)}>
                                        -{formatBalance(fromTokenAmount, fromToken?.decimals || 0)} {fromToken?.symbol}
                                    </ProgressiveText>
                                    <Typography className={classes.network}>{fromNetwork?.fullName}</Typography>
                                </div>
                            </div>
                        </div>
                        <div className={classes.token}>
                            <Typography className={classes.tokenTitle}>
                                <Trans>To</Trans>
                            </Typography>
                            <div className={classes.tokenInfo}>
                                <CoinIcon
                                    className={classes.tokenIcon}
                                    chainId={toChainId}
                                    address={toToken?.address || ''}
                                    disableBadge
                                />
                                <div className={classes.tokenValue}>
                                    <ProgressiveText loading={!toToken} className={cx(classes.toToken, classes.value)}>
                                        +{formatBalance(toTokenAmount, toToken?.decimals || 0)} {toToken?.symbol}
                                    </ProgressiveText>
                                    <Typography className={classes.network}>{toNetwork?.fullName}</Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                :   <LoadingStatus />}
                <div className={classes.infoList}>
                    <div className={classes.infoRow}>
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
                                {fromNetwork?.fullName || '--'} to {toNetwork?.fullName || '--'}
                            </Trans>
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>{fromNetwork?.name} Network fee</Trans>
                            <ShadowRootTooltip
                                placement="top"
                                title={t`This fee is used to pay miners and isn't collected by us. The actual cost may be less than estimated, and the unused fee won't be deducted from your account.`}>
                                <Icons.Questions size={16} />
                            </ShadowRootTooltip>
                        </Typography>
                        <Link
                            className={cx(classes.rowValue, classes.link)}
                            to={{ pathname: RoutePaths.NetworkFee, search: `?mode=${mode}` }}>
                            <Box display="flex" flexDirection="column">
                                <Typography className={classes.text}>
                                    {`${formatWeiToEther(gasFee).toFixed(4)} ${fromNetwork?.nativeCurrency.symbol ?? 'ETH'}${gasCost ? ` ≈ $${gasCost}` : ''}`}
                                </Typography>
                                <Typography className={classes.text}>
                                    <Select
                                        value={gasOptionType}
                                        _slow="Slow"
                                        _normal="Average"
                                        _fast="Fast"
                                        _custom="Custom"
                                    />
                                </Typography>
                            </Box>
                            <Icons.ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>{toNetwork?.name} Network fee</Trans>
                            <ShadowRootTooltip
                                placement="top"
                                title={t`In cross-chain transactions, this fee includes the estimated network fee and the cross-chain bridge's network fee which is $0.00 (0 OP_ETH). The network fees are paid to the miners and aren't charged by our platform.
The actual cost may be lower
than estimated, and any unused funds will remain in the original address.`}>
                                <Icons.Questions size={16} />
                            </ShadowRootTooltip>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            {toChainNetworkFee ?
                                `${formatBalance(toChainNetworkFee, toNetwork?.nativeCurrency.decimals)} ${toNetwork?.nativeCurrency.symbol ?? 'ETH'} $(${toNetworkFeeValue})`
                            :   '--'}
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>{bridge?.router.bridgeName} Bridge Network fee</Trans>
                            <ShadowRootTooltip
                                placement="top"
                                title={t`In cross-chain transactions, this fee includes the estimated network fee and the cross-chain bridge's network fee which is $0.00 (0 OP_ETH). The network fees are paid to the miners and aren't charged by our platform.
The actual cost may be lower
than estimated, and any unused funds will remain in the original address.`}>
                                <Icons.Questions size={16} />
                            </ShadowRootTooltip>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            {router?.crossChainFee} {bridgeFeeToken?.symbol ?? '--'} (${bridgeFeeValue})
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Wallet</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            {account}
                            <CopyButton text={account} size={16} display="flex" />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Rate</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>{rateNode}</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Minimum received</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            {formatBalance(bridge?.minimumReceived, toToken?.decimals || 0)} {toToken?.symbol ?? '--'}
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Data</Trans>
                        </Typography>
                        {isLoading ?
                            <LoadingBase size={24} />
                        :   <Icons.ArrowDownRound
                                className={expand ? classes.rotate : undefined}
                                size={24}
                                onClick={() => setExpand((v) => !v)}
                            />
                        }
                    </div>
                    {expand ?
                        <Typography className={classes.data}>{transaction?.data}</Typography>
                    :   null}
                    {showStale ?
                        <Warning description={t`Quote expired. Update to receive a new quote.`} />
                    :   null}
                </div>
            </div>
            <PluginWalletStatusBar className={classes.footer} requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM}>
                {showStale ?
                    <ActionButton
                        fullWidth
                        onClick={async () => {
                            await updateQuote()
                        }}>
                        {t`Update Quote`}
                    </ActionButton>
                :   <ActionButton fullWidth loading={loading} disabled={disabled} onClick={submit}>
                        {errorMessage ??
                            (isSending ? t`Sending`
                            : isCheckingApprove ? t`Checking Approve`
                            : isApproving ? t`Approving`
                            : t`Confirm Bridge`)}
                    </ActionButton>
                }
            </PluginWalletStatusBar>
        </div>
    )
})
