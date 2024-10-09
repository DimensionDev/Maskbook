import { t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import type { OKXBridgeQuote, OKXSwapQuote } from '@masknet/web3-providers/types'
import { dividedBy, formatCompact, leftShift, multipliedBy } from '@masknet/web3-shared-base'
import { Box, Typography, type BoxProps } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { bridges, DEFAULT_SLIPPAGE, RoutePaths } from '../../../constants.js'
import { useGasManagement, useTrade } from '../../contexts/index.js'
import { useLiquidityResources } from '../../hooks/useLiquidityResources.js'
import { useTokenPrice } from '../../hooks/useTokenPrice.js'
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    quote: {
        flexDirection: 'column',
    },
    infoRow: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        justifyContent: 'space-between',
    },
    rowName: {
        fontSize: 14,
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'center',
        flexGrow: 1,
        marginRight: 'auto',
    },
    rowValue: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
    },
    link: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
        textDecoration: 'none',
    },
    rotate: {
        transform: 'rotate(180deg)',
    },
    bestRoute: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    bridgeName: {
        fontSize: 14,
    },
    bestTag: {
        backgroundColor: theme.palette.maskColor.success,
        borderRadius: 4,
        lineHeight: '18px',
        fontSize: 14,
        padding: '2px 6px',
    },
}))

interface QuoteProps extends BoxProps {
    quote: OKXSwapQuote | OKXBridgeQuote
}

export function Quote({ quote, ...props }: QuoteProps) {
    const { classes, theme, cx } = useStyles()
    const { chainId, disabledDexIds, expand, setExpand, isAutoSlippage, slippage, mode, bridgeQuote } = useTrade()
    const isSwap = mode === 'swap'
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
    const { data: liquidityList = EMPTY_LIST } = useLiquidityResources(chainId)
    const dexIdsCount = liquidityList.filter((x) => !disabledDexIds.includes(x.id)).length

    const { data: nativeTokenPrice } = useTokenPrice(chainId, ZERO_ADDRESS)
    const { gasCost } = useGasManagement()

    const rateNode = (
        <>
            1 {baseToken.tokenSymbol} ≈ {rate ? formatCompact(rate.toNumber(), { maximumFractionDigits: 6 }) : '--'}{' '}
            {targetToken.tokenSymbol}
            <Icons.Cached size={16} color={theme.palette.maskColor.main} onClick={() => setForwardCompare((v) => !v)} />
        </>
    )

    const bestRouter = isSwap ? undefined : bridgeQuote?.routerList[0]
    const totalNetworkFee = useMemo(() => {
        if (!bestRouter || !nativeTokenPrice) return gasCost
        return multipliedBy(bestRouter.router.crossChainFee, nativeTokenPrice).plus(gasCost).toFixed()
    }, [gasCost, bestRouter, nativeTokenPrice])

    return (
        <Box {...props} className={cx(classes.quote, props.className)}>
            <div className={classes.infoRow}>
                <Typography className={classes.rowName}>{expand ? 'Trading info' : rateNode}</Typography>
                <Icons.ArrowDownRound
                    className={expand ? classes.rotate : undefined}
                    size={24}
                    onClick={() => setExpand((v) => !v)}
                />
            </div>
            {expand ?
                <>
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
                        <Typography className={classes.rowName}>Est Network fee</Typography>
                        <Typography className={classes.rowValue}>
                            {totalNetworkFee ? `$${totalNetworkFee}` : '--'}
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Slippage</Trans>
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography
                            component={Link}
                            className={cx(classes.rowValue, classes.link)}
                            to={{ pathname: RoutePaths.Slippage, search: `?mode=${mode}` }}>
                            <TextOverflowTooltip
                                as={ShadowRootTooltip}
                                placement="top"
                                title={isAutoSlippage ? `${DEFAULT_SLIPPAGE}%` : `${slippage}%`}>
                                <Box
                                    component="span"
                                    maxWidth="200px"
                                    textOverflow="ellipsis"
                                    overflow="hidden"
                                    whiteSpace="nowrap">
                                    {isAutoSlippage ? `${DEFAULT_SLIPPAGE}%` : `${slippage}%`}
                                </Box>
                            </TextOverflowTooltip>
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    {isSwap ?
                        <div className={classes.infoRow}>
                            <Typography className={classes.rowName}>Select liquidity</Typography>
                            <Typography
                                component={Link}
                                className={cx(classes.rowValue, classes.link)}
                                to={{ pathname: RoutePaths.SelectLiquidity, search: '?mode=swap' }}>
                                {dexIdsCount}/{liquidityList.length}
                                <Icons.ArrowRight size={20} />
                            </Typography>
                        </div>
                    :   null}
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            {isSwap ? t`Quote route` : t`Trading route`}
                        </Typography>
                        <Typography
                            component={Link}
                            className={cx(classes.rowValue, classes.link)}
                            to={
                                isSwap ?
                                    { pathname: RoutePaths.QuoteRoute, search: '?mode=swap' }
                                :   { pathname: RoutePaths.BridgeQuoteRoute, search: '?mode=bridge' }
                            }>
                            {!isSwap && bestRouter ?
                                <span className={classes.bestRoute}>
                                    <img
                                        src={bridges.find((x) => x.id === bestRouter.router.bridgeId)?.logoUrl}
                                        width={16}
                                        height={16}
                                    />
                                    <Typography component="span" className={classes.bridgeName}>
                                        {bestRouter.router.bridgeName}
                                    </Typography>
                                    <Typography component="span" className={classes.bestTag}>
                                        <Trans>Overall Best</Trans>
                                    </Typography>
                                </span>
                            :   null}
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
                </>
            :   null}
        </Box>
    )
}
