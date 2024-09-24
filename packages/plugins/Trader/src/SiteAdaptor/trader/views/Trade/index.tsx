import { t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { NetworkIcon, PluginWalletStatusBar, SelectFungibleTokenModal, TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworks } from '@masknet/web3-hooks-base'
import {
    formatBalance,
    isGreaterThan,
    isLessThan,
    isZero,
    leftShift,
    minus,
    multipliedBy,
} from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { Warning } from '../../../components/Warning.js'
import { RoutePaths } from '../../../constants.js'
import { useSwap } from '../../contexts/index.js'
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
    badgeIcon: {
        position: 'absolute',
        right: -3,
        bottom: -2,
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
        setChainId,
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
    } = useSwap()
    const isSwap = mode === 'swap'
    const quote = isSwap ? swapQuote : bridgeQuote
    const quoteErrorTitle = isSwap ? t`This swap isn’t supported` : undefined // t`This bridge isn’t supported`
    const quoteErrorMessage = isSwap ? swapQuoteErrorMessage : bridgeQuoteErrorMessage

    const fromNetwork = networks.find((x) => x.chainId === fromToken?.chainId)
    const toNetwork = networks.find((x) => x.chainId === toToken?.chainId)
    const chainQuery = useSupportedChains()

    const pickToken = async (currentToken: Web3Helper.FungibleTokenAll | null | undefined, side?: 'from' | 'to') => {
        const supportedChains = chainQuery.data ?? (await chainQuery.refetch()).data
        const isSwap = mode === 'swap'
        return SelectFungibleTokenModal.openAndWaitForClose({
            disableNativeToken: false,
            selectedTokens: currentToken ? [currentToken.address] : [],
            // Only from token can decide the chain
            chainId: (isSwap ? fromToken?.chainId : currentToken?.chainId) || chainId,
            pluginID: NetworkPluginID.PLUGIN_EVM,
            chains: supportedChains?.map((x) => x.chainId),
            okxOnly: true,
            lockChainId: isSwap && side === 'to' && !!fromToken?.chainId,
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

    const isTradable = isSwap ? !isSwappable : !isBridgable
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
                                    const picked = await pickToken(fromToken, 'from')
                                    if (picked) {
                                        setChainId(picked.chainId as ChainId)
                                        setFromToken(picked)
                                        if (toToken?.chainId !== picked.chainId) setToToken(undefined)
                                    }
                                }}>
                                <Box className={classes.icon}>
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        chainId={fromToken?.chainId}
                                        address={fromToken?.address || ''}
                                        logoURL={fromToken?.logoURL}
                                    />
                                    {fromToken ?
                                        <NetworkIcon
                                            pluginID={NetworkPluginID.PLUGIN_EVM}
                                            className={classes.badgeIcon}
                                            chainId={fromToken?.chainId}
                                            size={12}
                                        />
                                    :   null}
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="strong" className={classes.symbol}>
                                        {fromToken?.symbol ?? '--'}
                                    </Typography>
                                    <Typography component="span" className={classes.chain}>
                                        on {fromNetwork?.name ?? '--'}
                                    </Typography>
                                </Box>
                                <Icons.ArrowDrop size={16} />
                            </Box>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        <Box height="100%" position="relative">
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
                                    const picked = await pickToken(toToken, 'to')
                                    if (picked) setToToken(picked)
                                }}>
                                <Box className={classes.icon}>
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        chainId={toToken?.chainId}
                                        address={toToken?.address || ''}
                                        logoURL={toToken?.logoURL}
                                    />
                                    {toToken ?
                                        <NetworkIcon
                                            pluginID={NetworkPluginID.PLUGIN_EVM}
                                            className={classes.badgeIcon}
                                            chainId={toToken.chainId}
                                            size={12}
                                        />
                                    :   null}
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="strong" className={classes.symbol}>
                                        {toToken?.symbol ?? '--'}
                                    </Typography>
                                    <Typography component="span" className={classes.chain}>
                                        on {toNetwork?.name ?? '--'}
                                    </Typography>
                                </Box>
                                <Icons.ArrowDrop size={16} />
                            </Box>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        <Box height="100%" position="relative">
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
                    disabled={isTradable}
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
