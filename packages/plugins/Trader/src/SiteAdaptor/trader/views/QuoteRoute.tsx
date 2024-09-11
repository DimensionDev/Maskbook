import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useSwap } from '../contexts/index.js'
import { RoutePaths } from '../../constants.js'
import { BigNumber } from 'bignumber.js'
import { t } from '@lingui/macro'
import { EmptyStatus } from '@masknet/shared'
import { useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { multipliedBy } from '@masknet/web3-shared-base'
import type { OKXSwapQuote } from '@masknet/web3-providers/types'

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
    tooHigh: {
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

const calcValue = (compare: OKXSwapQuote['quoteCompareList'][number], tokenPrice: string, nativeTokenPrice: number) => {
    return multipliedBy(compare.amountOut, tokenPrice).minus(multipliedBy(compare.tradeFee, nativeTokenPrice))
}

export const QuoteRoute = memo(function QuoteRoute() {
    const { classes, theme } = useStyles()
    const { quote, chainId, slippage } = useSwap()
    const { data: price = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    if (!quote)
        return (
            <div className={classes.container}>
                <EmptyStatus />
            </div>
        )

    const { toToken, quoteCompareList } = quote
    const bestValue = calcValue(quoteCompareList[0], toToken.tokenUnitPrice, price)

    return (
        <div className={classes.container}>
            <Box className={classes.infoRow} py={0.5}>
                <Typography className={classes.rowName}>Dex/Est received ({quote?.toToken.tokenSymbol})</Typography>
                <Typography className={classes.rowValue}>
                    Rank
                    <ShadowRootTooltip
                        title={t`This is the price difference between the DEX with the highest composite price and other DEXs, which factors in the estimated received amount and network fee.`}>
                        <Icons.Questions size={16} color={theme.palette.maskColor.second} />
                    </ShadowRootTooltip>
                </Typography>
            </Box>
            {quote.quoteCompareList.map((compare, index) => {
                const isBest = index === 0
                const currentValue = calcValue(compare, toToken.tokenUnitPrice, price)
                const percent = currentValue.minus(bestValue).div(bestValue).times(100)
                const isOverSlippage = percent.abs().isGreaterThan(slippage)
                return (
                    <div className={classes.box} key={compare.dexName}>
                        <Typography className={classes.boxTitle}>
                            <img src={compare.dexLogo} width={16} height={16} />
                            {compare.dexName}
                            {isBest ?
                                <ShadowRootTooltip title="xxx">
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
                                    <Typography className={isOverSlippage ? classes.tooHigh : classes.normal}>
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
