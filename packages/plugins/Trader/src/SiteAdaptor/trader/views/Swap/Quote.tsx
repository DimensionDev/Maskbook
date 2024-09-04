import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import type { OKXSwapQuote } from '@masknet/web3-providers/types'
import { dividedBy, formatCompact } from '@masknet/web3-shared-base'
import { Box, Typography, type BoxProps } from '@mui/material'
import { useState } from 'react'
import { useLiquidityResources } from '../../hooks/useLiquidityResources.js'
import { useSwap } from '../../contexts/index.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { RoutePaths } from '../../../constants.js'
import { useNavigate } from 'react-router-dom'

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
    },
    rotate: {
        transform: 'rotate(180deg)',
    },
}))

interface QuoteProps extends BoxProps {
    quote: OKXSwapQuote
}

export function Quote({ quote, ...props }: QuoteProps) {
    const { classes, theme, cx } = useStyles()
    const navigate = useNavigate()
    const { chainId, disabledDexIds, expand, setExpand } = useSwap()
    const [forwardCompare, setForwardCompare] = useState(true)
    const [baseToken, targetToken] =
        forwardCompare ? [quote?.fromToken, quote?.toToken] : [quote?.toToken, quote?.fromToken]
    const rate =
        quote ?
            forwardCompare && quote ?
                dividedBy(quote.toTokenAmount, quote.fromTokenAmount)
            :   dividedBy(quote.fromTokenAmount, quote.toTokenAmount)
        :   null
    const { data: liquidityRes } = useLiquidityResources(chainId)
    const liquidityList = liquidityRes?.code === '0' ? liquidityRes.data : EMPTY_LIST
    const dexIdsCount = liquidityList.filter((x) => !disabledDexIds.includes(x.id)).length

    const rateNode = (
        <>
            1 {baseToken.tokenSymbol} ≈ {formatCompact(rate!.toNumber())} {targetToken.tokenSymbol}
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
                        <Typography className={classes.rowName}>
                            Rate
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography className={classes.rowValue}>{rateNode}</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>Est Network fee</Typography>
                        <Typography className={classes.rowValue}>$2.46</Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            Slippage
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography className={classes.rowValue}>
                            0.5%
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>Select liquidity</Typography>
                        <Typography
                            className={cx(classes.rowValue, classes.link)}
                            onClick={() => {
                                navigate(RoutePaths.SelectLiquidity)
                            }}>
                            {dexIdsCount}/{liquidityList.length}
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            Quote route
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography className={classes.rowValue}>
                            🎉 1.24
                            <Icons.ArrowRight size={20} />
                        </Typography>
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.rowName}>
                            Powered by
                            <Icons.Questions size={16} />
                        </Typography>
                        <Typography className={classes.rowValue}>OKX</Typography>
                    </div>
                </>
            :   null}
        </Box>
    )
}
