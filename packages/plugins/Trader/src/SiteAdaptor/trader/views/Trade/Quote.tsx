import { Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { OKXBridgeQuote, OKXSwapQuote } from '@masknet/web3-providers/types'
import { dividedBy, formatCompact, leftShift } from '@masknet/web3-shared-base'
import { Box, Typography, type BoxProps } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_SLIPPAGE, RoutePaths } from '../../../constants.js'
import { useSwap } from '../../contexts/index.js'
import { useLiquidityResources } from '../../hooks/useLiquidityResources.js'

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
}))

interface QuoteProps extends BoxProps {
    quote: OKXSwapQuote | OKXBridgeQuote
}

export function Quote({ quote, ...props }: QuoteProps) {
    const { classes, theme, cx } = useStyles()
    const { chainId, disabledDexIds, expand, setExpand, isAutoSlippage, slippage, mode } = useSwap()
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

    const rateNode = (
        <>
            1 {baseToken.tokenSymbol} ≈ {rate ? formatCompact(rate.toNumber()) : '--'} {targetToken.tokenSymbol}
            <Icons.Cached size={16} color={theme.palette.maskColor.main} onClick={() => setForwardCompare((v) => !v)} />
        </>
    )

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
                        <Typography className={classes.rowName}>Trading mode</Typography>
                        <Typography className={classes.rowValue}>Aggregator</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>Rate</Typography>
                        <Typography className={classes.rowValue}>{rateNode}</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>Est Network fee</Typography>
                        <Typography className={classes.rowValue}>$2.46</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Slippage</Trans>
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography
                            component={Link}
                            className={cx(classes.rowValue, classes.link)}
                            to={RoutePaths.Slippage}>
                            {isAutoSlippage ? `${DEFAULT_SLIPPAGE}%` : `${slippage}%`}
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    {isSwap ?
                        <div className={classes.infoRow}>
                            <Typography className={classes.rowName}>Select liquidity</Typography>
                            <Typography
                                component={Link}
                                className={cx(classes.rowValue, classes.link)}
                                to={RoutePaths.SelectLiquidity}>
                                {dexIdsCount}/{liquidityList.length}
                                <Icons.ArrowRight size={20} />
                            </Typography>
                        </div>
                    :   null}
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            <Trans>Quote route</Trans>
                        </Typography>
                        <Typography
                            component={Link}
                            className={cx(classes.rowValue, classes.link)}
                            to={
                                isSwap ?
                                    { pathname: RoutePaths.QuoteRoute, search: '?mode=swap' }
                                :   { pathname: RoutePaths.BridgeQuoteRoute, search: '?mode=swap' }
                            }>
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Trans>
                            <Typography className={classes.rowName}>Powered by </Typography>
                            <Typography className={classes.rowValue}>
                                OKX
                                <Icons.Okx size={18} />
                            </Typography>
                        </Trans>
                    </div>
                </>
            :   null}
        </Box>
    )
}
