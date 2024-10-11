import { t, Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { EmptyStatus } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { useGasPrice, useNativeToken, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import type { OKXSwapQuote } from '@masknet/web3-providers/types'
import { isZero, multipliedBy, ZERO } from '@masknet/web3-shared-base'
import { type ChainId, formatAmount } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { useTrade } from '../contexts/index.js'
import { useLiquidityResources } from '../hooks/useLiquidityResources.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing(0, 2),
        boxSizing: 'border-box',
        gap: theme.spacing(1),
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1.5),
        border: `1px solid ${theme.palette.maskColor.line}`,
    },
    boxTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
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
    highlight: {
        backgroundColor: theme.palette.maskColor.success,
        lineHeight: '20px',
        fontSize: 16,
        fontWeight: 700,
        padding: theme.spacing(0.5, 1),
        color: theme.palette.maskColor.white,
        borderRadius: theme.spacing(0.5),
    },
    tooSmall: {
        backgroundColor: 'rgba(255, 53, 69, 0.1)',
        lineHeight: '20px',
        fontSize: 16,
        fontWeight: 400,
        padding: theme.spacing(0.5, 1),
        color: theme.palette.maskColor.danger,
        borderRadius: theme.spacing(0.5),
    },
    normal: {
        backgroundColor: theme.palette.maskColor.bg,
        lineHeight: '20px',
        fontSize: 16,
        fontWeight: 400,
        padding: theme.spacing(0.5, 1),
        color: theme.palette.maskColor.main,
        borderRadius: theme.spacing(0.5),
    },
    tags: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
    },
    tag: {
        fontSize: 12,
        lineHeight: '16px',
        display: 'inline-flex',
        gap: theme.spacing(0.5),
        padding: theme.spacing(0.5),
        borderRadius: theme.spacing(0.5),
        backgroundColor: theme.palette.maskColor.bg,
        color: theme.palette.maskColor.main,
        textDecoration: 'none',
    },
}))

const calcValue = (compare: OKXSwapQuote['quoteCompareList'][number], tokenPrice: string) => {
    return multipliedBy(compare.amountOut, tokenPrice).minus(compare.tradeFee)
}

/**
 * QuoteCompareList might be missed.
 */
function useCompareList(quote: OKXSwapQuote | undefined, chainId: ChainId) {
    const { data: dexes = EMPTY_LIST } = useLiquidityResources(chainId, quote?.quoteCompareList?.length === 0)
    const { data: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const [gasPrice] = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })

    const compareList = useMemo(() => {
        if (!quote) return EMPTY_LIST
        if (quote.quoteCompareList.length) return quote.quoteCompareList
        const firstSubRouterDex = quote.dexRouterList[0].subRouterList[0].dexProtocol[0].dexName
        const compareList: OKXSwapQuote['quoteCompareList'] = [
            {
                amountOut: formatAmount(quote.toTokenAmount, -quote.toToken.decimals),
                dexLogo: dexes.find((x) => x.name === firstSubRouterDex)?.logo as string,
                dexName: firstSubRouterDex,
                tradeFee: '0',
            },
        ]
        return compareList
    }, [quote, dexes, nativeTokenPrice, gasPrice, nativeToken])
    return compareList
}

export const QuoteRoute = memo(function QuoteRoute() {
    const { classes, theme } = useStyles()
    const { quote, chainId } = useTrade()

    const compareList = useCompareList(quote, chainId)
    if (!quote)
        return (
            <Box className={classes.container} justifyContent="center">
                <EmptyStatus />
            </Box>
        )
    const { toToken } = quote

    const bestValue = compareList[0] ? calcValue(compareList[0], toToken.tokenUnitPrice) : 0

    return (
        <div className={classes.container}>
            <Box className={classes.infoRow} py={0.5}>
                <Typography className={classes.rowName}>
                    <Trans>Dex/Est received ({quote?.toToken.tokenSymbol})</Trans>
                </Typography>
                <Typography className={classes.rowValue}>
                    Rank
                    <ShadowRootTooltip
                        title={t`This is the price difference between the DEX with the highest composite price and other DEXs, which factors in the estimated received amount and network fee.`}>
                        <Icons.Questions size={16} color={theme.palette.maskColor.second} />
                    </ShadowRootTooltip>
                </Typography>
            </Box>
            {compareList.map((compare, index) => {
                const isBest = index === 0
                const currentValue = calcValue(compare, toToken.tokenUnitPrice)
                const percent = isZero(bestValue) ? ZERO : currentValue.minus(bestValue).div(bestValue).times(100)
                const isTooSmall = percent.isLessThan(-1)

                return (
                    <div className={classes.box} key={compare.dexName}>
                        <Typography className={classes.boxTitle}>
                            <img src={compare.dexLogo} width={16} height={16} />
                            {compare.dexName}
                            {compare.dexName.toLowerCase().includes('okx') ?
                                <ShadowRootTooltip
                                    title={t`OKX DEX refers to the OKX DEX aggregator, which chooses the best route to place an order through all integrated third-party DEXs (some of them are shown below).  Note that OKX DEX derives all its liquidity from third-party liquidity pools. OKX DEX does NOT conduct any transactions directly.`}>
                                    <Icons.Questions size={16} />
                                </ShadowRootTooltip>
                            :   null}
                        </Typography>

                        <div className={classes.infoRow}>
                            <Typography className={classes.rowName} fontWeight={700}>
                                {new BigNumber(compare.amountOut).toFixed(4)}
                            </Typography>
                            {isBest ?
                                <div className={classes.rowValue}>
                                    <Typography className={classes.highlight}>Best</Typography>
                                </div>
                            :   <div className={classes.rowValue}>
                                    <Typography className={isTooSmall ? classes.tooSmall : classes.normal}>
                                        {percent.toFixed(2)}%
                                    </Typography>
                                </div>
                            }
                        </div>
                        <div className={classes.tags}>
                            <Typography className={classes.tag}>
                                <Icons.Gas size={16} />${new BigNumber(compare.tradeFee).toFixed(4)}
                            </Typography>
                            {isBest ?
                                <Typography component={Link} className={classes.tag} to={RoutePaths.TradingRoute}>
                                    Route info <Icons.ArrowRight size={16} />
                                </Typography>
                            :   null}
                        </div>
                    </div>
                )
            })}
        </div>
    )
})
