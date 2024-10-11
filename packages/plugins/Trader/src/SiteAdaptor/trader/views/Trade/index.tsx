import { t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { PluginWalletStatusBar, SelectFungibleTokenModal } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFungibleTokenBalance, useNetworks } from '@masknet/web3-hooks-base'
import {
    formatBalance,
    isGreaterThan,
    isLessThan,
    isZero,
    leftShift,
    minus,
    multipliedBy,
    trimZero,
} from '@masknet/web3-shared-base'
import { isNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'
import { Box, Button, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { CoinIcon } from '../../../components/CoinIcon.js'
import { Warning } from '../../../components/Warning.js'
import { RoutePaths } from '../../../constants.js'
import { useGasManagement, useTrade } from '../../contexts/index.js'
import { formatTokenBalance } from '../../helpers.js'
import { useBridgable } from '../../hooks/useBridgable.js'
import { useSupportedChains } from '../../hooks/useSupportedChains.js'
import { useSwappable } from '../../hooks/useSwappable.js'
import { Quote } from './Quote.js'

const useStyles = makeStyles()((theme) => ({
    view: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        minHeight: 0,
        flexGrow: 1,
        overflow: 'auto',
        scrollbarWidth: 'none',
    },
    box: {
        position: 'relative',
        border: `1px solid ${theme.palette.maskColor.line}`,
        padding: theme.spacing(1.5),
        borderRadius: 12,
        display: 'flex',
        gap: theme.spacing(1),
    },
    swapButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: '50%',
        top: -22,
        transform: 'translateX(-50%) rotate(90deg)',
        width: 32,
        height: 32,
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: '50%',
        color: theme.palette.maskColor.main,
        backgroundColor: theme.palette.maskColor.bottom,
        cursor: 'pointer',
    },
    token: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        cursor: 'pointer',
    },
    icon: {
        position: 'relative',
        width: 30,
        height: 30,
    },
    tokenIcon: {
        height: 30,
        width: 30,
    },
    symbol: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    chain: {
        fontSize: 13,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    tokenStatus: {
        position: 'absolute',
        right: 0,
        top: 0,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    balance: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    tokenInput: {
        height: '100%',
        width: '100%',
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        textAlign: 'right',
    },
    tokenValue: {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    maxButton: {
        padding: '0 6px',
        fontSize: 12,
        lineHeight: '16px',
        color: theme.palette.maskColor.bottom,
        backgroundColor: theme.palette.maskColor.main,
        borderRadius: 4,
        minWidth: 0,
    },
    diff: {
        marginLeft: theme.spacing(0.5),
    },
    footer: {
        flexShrink: 0,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
}))

export function TradeView() {
    const navigate = useNavigate()
    const { classes, theme } = useStyles()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const {
        mode,
        chainId,
        fromToken,
        setFromToken,
        toToken,
        setToToken,
        inputAmount,
        setInputAmount,
        quote: swapQuote,
        swapQuoteErrorMessage,
        bridgeQuote,
        bridgeQuoteErrorMessage,
        slippage,
        isQuoteLoading,
        isBridgeQuoteLoading,
    } = useTrade()
    const isSwap = mode === 'swap'
    const quote = isSwap ? swapQuote : bridgeQuote
    const quoteErrorTitle = isSwap ? t`This swap isn’t supported` : undefined // t`This bridge isn’t supported`
    const quoteErrorMessage = isSwap ? swapQuoteErrorMessage : bridgeQuoteErrorMessage

    const fromChainId = fromToken?.chainId as ChainId
    const toChainId = toToken?.chainId as ChainId
    const fromNetwork = networks.find((x) => x.chainId === fromChainId)
    const toNetwork = networks.find((x) => x.chainId === toChainId)
    const chainQuery = useSupportedChains()
    const { data: fromTokenBalance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, fromToken?.address, {
        chainId: fromChainId,
    })
    const { gasFee } = useGasManagement()
    const { data: toTokenBalance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, toToken?.address, {
        chainId: toChainId,
    })

    const pickToken = async (
        currentToken: Web3Helper.FungibleTokenAll | null | undefined,
        side: 'from' | 'to',
        excludes: string[],
    ) => {
        const supportedChains = chainQuery.data ?? (await chainQuery.refetch()).data
        return SelectFungibleTokenModal.openAndWaitForClose({
            disableNativeToken: false,
            selectedTokens: excludes,
            // Only from token can decide the chain
            chainId: (isSwap ? fromChainId : currentToken?.chainId) || chainId,
            pluginID: NetworkPluginID.PLUGIN_EVM,
            chains: supportedChains?.map((x) => x.chainId),
            okxOnly: true,
            lockChainId: isSwap && side === 'to' && !!fromChainId,
        })
    }

    const toTokenAmount = isSwap ? quote?.toTokenAmount : bridgeQuote?.toTokenAmount
    const { fromTokenValue, toTokenValue, priceDiff } = useMemo(() => {
        if (!quote) return { fromTokenValue: null, toTokenValue: null, priceDiff: null }
        const { fromToken, toToken, toTokenAmount } = quote
        const fromTokenValue =
            inputAmount && fromToken ? multipliedBy(inputAmount, quote.fromToken.tokenUnitPrice ?? '0') : null
        const toTokenValue =
            quote ? multipliedBy(leftShift(toTokenAmount, toToken.decimals), toToken.tokenUnitPrice ?? '0') : null
        const priceDiff =
            fromTokenValue && toTokenValue ? minus(toTokenValue, fromTokenValue).div(fromTokenValue).times(100) : null
        return {
            fromTokenValue: fromTokenValue?.toFixed(2),
            toTokenValue: toTokenValue?.toFixed(2),
            priceDiff,
        }
    }, [quote, inputAmount])
    const isOverSlippage = priceDiff && isLessThan(priceDiff, 0) && priceDiff.abs().isGreaterThan(slippage)

    const [isSwappable, swapErrorMessage] = useSwappable()
    const [isBridgable, bridgeErrorMessage] = useBridgable()
    const errorMessage = isSwap ? swapErrorMessage : bridgeErrorMessage

    const isTradable = isSwap ? isSwappable : isBridgable
    const isLoading = isSwap ? isQuoteLoading : isBridgeQuoteLoading
    const swapButtonLabel = isOverSlippage ? t`Swap anyway` : t`Swap`
    const bridgeButtonLabel = isOverSlippage ? t`Bridge anyway` : t`Bridge`
    return (
        <div className={classes.view}>
            <Box className={classes.container}>
                <Box className={classes.box}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography lineHeight="18px" fontWeight="700" fontSize="14px">
                            <Trans>From</Trans>
                        </Typography>
                        <Box display="flex" flexDirection="row">
                            <Box
                                className={classes.token}
                                onClick={async () => {
                                    const picked = await pickToken(
                                        fromToken,
                                        'from',
                                        isSwap && toToken?.address ? [toToken.address] : [],
                                    )
                                    if (picked) {
                                        setInputAmount('')
                                        setFromToken(picked)
                                        if (toChainId !== picked.chainId && isSwap) setToToken(undefined)
                                    }
                                }}>
                                <Box className={classes.icon}>
                                    {/* Omit logoURL, let TokenIcon resolve it itself */}
                                    <CoinIcon
                                        className={classes.tokenIcon}
                                        chainId={fromChainId as ChainId}
                                        address={fromToken?.address || ''}
                                        chainIconSize={12}
                                    />
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="strong" className={classes.symbol}>
                                        {fromToken?.symbol ?? '--'}
                                    </Typography>
                                    <Typography component="span" className={classes.chain}>
                                        {fromNetwork?.fullName ? t`on ${fromNetwork.fullName}` : '--'}
                                    </Typography>
                                </Box>
                                <Icons.ArrowDrop size={16} />
                            </Box>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        <Box height="100%" position="relative">
                            {fromTokenBalance ?
                                <Box className={classes.tokenStatus}>
                                    <Icons.Wallet size={16} />
                                    <Typography className={classes.balance}>
                                        {formatTokenBalance(fromTokenBalance, fromToken?.decimals)}
                                    </Typography>
                                    <Button
                                        type="button"
                                        className={classes.maxButton}
                                        onClick={() => {
                                            if (!fromToken?.address) return
                                            const isNative = isNativeTokenAddress(fromToken.address)
                                            const balance =
                                                isNative ? minus(fromTokenBalance, gasFee) : fromTokenBalance
                                            setInputAmount(
                                                trimZero(leftShift(balance, fromToken.decimals).toFixed(12, 1)),
                                            )
                                        }}>
                                        <Trans>MAX</Trans>
                                    </Button>
                                </Box>
                            :   null}
                            <input
                                className={classes.tokenInput}
                                autoFocus
                                value={inputAmount}
                                onChange={(e) => {
                                    setInputAmount(e.currentTarget.value)
                                }}
                            />
                            {fromTokenValue ?
                                <Typography className={classes.tokenValue}>${fromTokenValue}</Typography>
                            :   null}
                        </Box>
                    </Box>
                </Box>
                <Box className={classes.box}>
                    <Box
                        className={classes.swapButton}
                        onClick={() => {
                            setInputAmount('')
                            setFromToken(toToken)
                            setToToken(fromToken)
                        }}>
                        <Icons.BiArrow size={16} color={theme.palette.maskColor.main} />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography lineHeight="18px" fontWeight="700" fontSize="14px">
                            To
                        </Typography>
                        <Box display="flex" flexDirection="row">
                            <Box
                                className={classes.token}
                                onClick={async () => {
                                    const picked = await pickToken(
                                        toToken,
                                        'to',
                                        isSwap && fromToken ? [fromToken.address] : [],
                                    )
                                    if (picked) setToToken(picked)
                                }}>
                                <Box className={classes.icon}>
                                    <CoinIcon
                                        className={classes.tokenIcon}
                                        chainId={toChainId as ChainId}
                                        address={toToken?.address || ''}
                                        chainIconSize={12}
                                    />
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="strong" className={classes.symbol}>
                                        {toToken?.symbol ?? '--'}
                                    </Typography>
                                    <Typography component="span" className={classes.chain}>
                                        {toNetwork?.fullName ? t`on ${toNetwork.fullName}` : '--'}
                                    </Typography>
                                </Box>
                                <Icons.ArrowDrop size={16} />
                            </Box>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        <Box height="100%" position="relative">
                            {toTokenBalance ?
                                <Box className={classes.tokenStatus}>
                                    <Icons.Wallet size={16} />
                                    <Typography className={classes.balance}>
                                        {formatTokenBalance(toTokenBalance, toToken?.decimals)}
                                    </Typography>
                                </Box>
                            :   null}
                            <input
                                className={classes.tokenInput}
                                disabled
                                value={toTokenAmount ? formatBalance(toTokenAmount, toToken?.decimals) : ''}
                            />
                            {toTokenValue ?
                                <Typography className={classes.tokenValue}>
                                    ${toTokenValue}
                                    {priceDiff && !isZero(priceDiff) ?
                                        <Typography
                                            component="span"
                                            className={classes.diff}
                                            color={
                                                isGreaterThan(priceDiff, 0) ?
                                                    theme.palette.maskColor.success
                                                :   theme.palette.maskColor.danger
                                            }>
                                            ({isGreaterThan(priceDiff, 0) ? '+' : ''}
                                            {priceDiff.toFixed(2)}%)
                                        </Typography>
                                    :   null}
                                </Typography>
                            :   null}
                        </Box>
                    </Box>
                </Box>

                {quoteErrorMessage ?
                    <Warning title={quoteErrorTitle} description={quoteErrorMessage} />
                :   null}

                {quote ?
                    <Quote className={classes.box} quote={quote} />
                :   null}
            </Box>
            <PluginWalletStatusBar className={classes.footer} requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM}>
                <ActionButton
                    loading={isLoading}
                    fullWidth
                    color={isOverSlippage ? 'error' : undefined}
                    disabled={!isTradable}
                    onClick={() => {
                        navigate(
                            urlcat(isSwap ? RoutePaths.Confirm : RoutePaths.BridgeConfirm, {
                                mode,
                            }),
                        )
                    }}>
                    {errorMessage ?? (isSwap ? swapButtonLabel : bridgeButtonLabel)}
                </ActionButton>
            </PluginWalletStatusBar>
        </div>
    )
}
