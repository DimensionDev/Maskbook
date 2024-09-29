import { Select, t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { LoadingStatus, PluginWalletStatusBar, ProgressiveText, TokenIcon } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, LoadingBase, makeStyles, ShadowRootTooltip, useCustomSnackbar } from '@masknet/theme'
import { useAccount, useNetwork, useNetworkDescriptor, useWeb3Connection, useWeb3Utils } from '@masknet/web3-hooks-base'
import { useERC20TokenApproveCallback } from '@masknet/web3-hooks-evm'
import {
    dividedBy,
    formatBalance,
    formatCompact,
    GasOptionType,
    isLessThan,
    leftShift,
    rightShift,
} from '@masknet/web3-shared-base'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import { Box, Typography, Link as MuiLink } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { memo, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import urlcat from 'urlcat'
import { Warning } from '../../components/Warning.js'
import { DEFAULT_SLIPPAGE, RoutePaths } from '../../constants.js'
import { addTransaction } from '../../storage.js'
import { useGasManagement, useTrade } from '../contexts/index.js'
import { useLeave } from '../hooks/useLeave.js'
import { useLiquidityResources } from '../hooks/useLiquidityResources.js'
import { useSwapData } from '../hooks/useSwapData.js'
import { useSwappable } from '../hooks/useSwappable.js'
import { useSwapSpender } from '../hooks/useSwapSpender.js'
import { useWaitForTransaction } from '../hooks/useWaitForTransaction.js'
import { useGetTransferReceived } from '../hooks/useGetTransferReceived.js'

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
    },
    rowValue: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '18px',
        gap: theme.spacing(0.5),
        fontSize: 14,
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
    toastLink: {
        display: 'flex',
        alignItems: 'center',
        outline: 'none',
    },
}))

export const Confirm = memo(function Confirm() {
    const { classes, cx, theme } = useStyles()
    const navigate = useNavigate()
    const {
        mode,
        inputAmount,
        nativeToken,
        fromToken,
        toToken,
        chainId,
        disabledDexIds,
        isAutoSlippage,
        slippage,
        quote,
        isQuoteStale,
        updateQuote,
    } = useTrade()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const network = useNetwork(NetworkPluginID.PLUGIN_EVM, chainId)
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const decimals = fromToken?.decimals
    const amount = useMemo(
        () => (inputAmount && decimals ? rightShift(inputAmount, decimals).toFixed(0) : ''),
        [inputAmount, decimals],
    )
    const { data: liquidityList = EMPTY_LIST } = useLiquidityResources(chainId)
    const remainLiquidityList =
        disabledDexIds.length ? liquidityList.filter((x) => !disabledDexIds.includes(x.id)) : liquidityList
    const dexIdsCount = remainLiquidityList.length
    const { data: swap, isLoading } = useSwapData({
        chainId: chainId.toString(),
        amount,
        fromTokenAddress: fromToken?.address,
        toTokenAddress: toToken?.address,
        slippage: new BigNumber(isAutoSlippage || !slippage ? DEFAULT_SLIPPAGE : slippage).div(100).toString(),
        userWalletAddress: account,
        dexIds: remainLiquidityList === liquidityList ? undefined : remainLiquidityList.map((x) => x.id).join(','),
    })
    const { gasFee, gasCost, gasLimit, gasConfig, gasOptions } = useGasManagement()
    const gasOptionType = gasConfig.gasOptionType ?? GasOptionType.NORMAL
    const [expand, setExpand] = useState(false)
    const transaction = swap?.data[0]?.tx
    const routerResult = swap?.data[0]?.routerResult
    const fromToken_ = routerResult?.fromToken
    const fromTokenAmount = routerResult?.fromTokenAmount
    const toToken_ = routerResult?.toToken
    const toTokenAmount = routerResult?.toTokenAmount

    const [forwardCompare, setForwardCompare] = useState(true)
    const [baseToken, targetToken] =
        forwardCompare ? [quote?.fromToken, quote?.toToken] : [quote?.toToken, quote?.fromToken]
    const rate = useMemo(() => {
        const fromAmount = leftShift(fromTokenAmount || 0, fromToken?.decimals || 1)
        const toAmount = leftShift(toTokenAmount || 0, toToken?.decimals || 1)
        if (fromAmount.isZero() || toAmount.isZero()) return null
        return forwardCompare ? dividedBy(toAmount, fromAmount) : dividedBy(fromAmount, toAmount)
    }, [fromTokenAmount, toToken, fromToken, toToken])

    const rateNode =
        baseToken && targetToken && rate ?
            <>
                1 {baseToken.tokenSymbol} ≈ {formatCompact(rate.toNumber())} {targetToken.tokenSymbol}
                <Icons.Cached
                    size={16}
                    color={theme.palette.maskColor.main}
                    onClick={() => setForwardCompare((v) => !v)}
                />
            </>
        :   null

    const [isSwappable, errorMessage] = useSwappable()
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const [{ loading: isSending }, sendSwap] = useAsyncFn(async () => {
        if (!transaction?.data) return
        return Web3.sendTransaction({
            data: transaction.data,
            to: transaction.to,
            from: account,
            value: transaction.value,
            gasPrice: gasConfig.gasPrice ?? transaction.gasPrice,
            gas: transaction.gas,
            maxPriorityFeePerGas:
                'maxPriorityFeePerGas' in gasConfig && gasConfig.maxFeePerGas ?
                    gasConfig.maxFeePerGas
                :   transaction.maxPriorityFeePerGas,
            _disableSuccessSnackbar: true,
        })
    }, [transaction, account, gasConfig, Web3])

    const { data: spender, isLoading: isLoadingSpender } = useSwapSpender()

    const [{ isNativeToken }, { loading: isApproving, loadingApprove, loadingAllowance }, approve, , refetchAllowance] =
        useERC20TokenApproveCallback(fromToken?.address || '', amount, spender)

    const loading = isSending || isApproving || loadingApprove || isLoadingSpender
    const disabled = !isSwappable || loading || dexIdsCount === 0
    const showStale = isQuoteStale && !isSending && !isApproving

    const { showSnackbar } = useCustomSnackbar()
    const leaveRef = useLeave()
    const Utils = useWeb3Utils(NetworkPluginID.PLUGIN_EVM)
    const waitForTransaction = useWaitForTransaction()
    const getReceived = useGetTransferReceived(chainId)

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                {swap ?
                    <div className={classes.pair}>
                        <div className={classes.token}>
                            <Typography className={classes.tokenTitle}>
                                <Trans>From</Trans>
                            </Typography>
                            <div className={classes.tokenInfo}>
                                <TokenIcon
                                    className={classes.tokenIcon}
                                    chainId={fromToken?.chainId}
                                    address={fromToken?.address || ''}
                                    logoURL={fromToken?.logoURL}
                                />
                                <div className={classes.tokenValue}>
                                    <ProgressiveText
                                        loading={!fromToken_}
                                        className={cx(classes.fromToken, classes.value)}>
                                        -{formatBalance(fromTokenAmount, fromToken?.decimals ?? 0)}{' '}
                                        {fromToken_?.tokenSymbol}
                                    </ProgressiveText>
                                    <Typography className={classes.network}>{network?.name}</Typography>
                                </div>
                            </div>
                        </div>
                        <div className={classes.token}>
                            <Typography className={classes.tokenTitle}>
                                <Trans>To</Trans>
                            </Typography>
                            <div className={classes.tokenInfo}>
                                <TokenIcon
                                    className={classes.tokenIcon}
                                    chainId={toToken?.chainId}
                                    address={toToken?.address || ''}
                                    logoURL={toToken?.logoURL}
                                />
                                <div className={classes.tokenValue}>
                                    <ProgressiveText loading={!toToken_} className={cx(classes.toToken, classes.value)}>
                                        +{formatBalance(toTokenAmount, toToken?.decimals ?? 0)} {toToken_?.tokenSymbol}
                                    </ProgressiveText>
                                    <Typography className={classes.network}>{network?.name}</Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                :   <LoadingStatus />}
                <div className={classes.infoList}>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Trading mode</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            <Trans>Aggregator</Trans>
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
                            <Trans>Network fee</Trans>
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
                                    {`${formatWeiToEther(gasFee).toFixed(4)} ${nativeToken?.symbol ?? 'ETH'}${gasCost ? ` ≈ $${gasCost}` : ''}`}
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
                            <Trans>Select liquidity</Trans>
                        </Typography>
                        <Typography
                            className={cx(classes.rowValue, classes.link)}
                            onClick={() => {
                                navigate(urlcat(RoutePaths.SelectLiquidity, { mode }))
                            }}>
                            {dexIdsCount}/{liquidityList.length}
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Powered by</Trans>
                        </Typography>
                        <Typography className={classes.rowValue}>
                            OKX
                            <Icons.Okx size={18} />
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
                :   <ActionButton
                        fullWidth
                        loading={loading}
                        disabled={disabled}
                        onClick={async () => {
                            if (!fromToken || !toToken || !transaction?.to || !spender) return
                            if (!isNativeToken) {
                                const { data: allowance = '0' } = await refetchAllowance()
                                if (isLessThan(allowance, amount)) await approve()
                            }

                            const hash = await sendSwap()

                            if (!hash) {
                                showSnackbar(t`Transaction rejected`, {
                                    title: t`Swap`,
                                    variant: 'error',
                                })
                                return
                            }
                            try {
                                await waitForTransaction({ chainId, hash })
                                const received = await getReceived(hash, account)
                                if (received && !leaveRef.current) {
                                    showSnackbar(t`Swap`, {
                                        message: (
                                            <MuiLink
                                                className={classes.toastLink}
                                                color="inherit"
                                                href={Utils.explorerResolver.transactionLink(chainId, hash)}
                                                tabIndex={-1}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                {t`${formatBalance(received, toToken.decimals)} ${toToken.symbol} swap completed successfully.`}{' '}
                                                <Icons.LinkOut size={16} sx={{ ml: 0.5 }} />
                                            </MuiLink>
                                        ),
                                        variant: 'success',
                                    })
                                }
                            } catch (error) {
                                showSnackbar(t`Wait too long for the confirmation.`, {
                                    variant: 'error',
                                })
                            }

                            const estimatedSeconds =
                                gasOptions ?
                                    gasOptions[gasConfig.gasOptionType ?? GasOptionType.NORMAL].estimatedSeconds
                                :   networkDescriptor?.averageBlockDelay
                            await addTransaction(account, {
                                kind: 'swap',
                                hash,
                                chainId,
                                fromToken: {
                                    chainId,
                                    decimals: +fromToken.decimals,
                                    contractAddress: fromToken.address,
                                    symbol: fromToken.symbol,
                                    logo: fromToken.logoURL,
                                },
                                fromTokenAmount,
                                toToken: {
                                    chainId,
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
                                estimatedTime: estimatedSeconds ?? 10,
                                gasLimit: gasLimit || gasConfig.gas || '1',
                                gasPrice: gasConfig.gasPrice || '0',
                            })
                            if (leaveRef.current) return
                            const url = urlcat(RoutePaths.Transaction, { hash, chainId, mode })
                            navigate(url, { replace: true })
                        }}>
                        {errorMessage ??
                            (isSending ? t`Sending`
                            : loadingAllowance ? t`Checking Approve`
                            : isApproving ? t`Approving`
                            : t`Confirm Swap`)}
                    </ActionButton>
                }
            </PluginWalletStatusBar>
        </div>
    )
})
