import { Icons } from '@masknet/icons'
import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { dividedBy, formatCompact } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { useSwap } from '../contexts/index.js'
import { useLiquidityResources } from '../hooks/useLiquidityResources.js'
import { EMPTY_LIST } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing(2),
    },
    pair: {
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 12,
        padding: theme.spacing(1.5),
    },
    token: {
        display: 'flex',
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
        color: theme.palette.maskColor.second,
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
    warning: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1.5),
        borderRadius: 12,
        backgroundColor: 'rgba(255, 177, 0, 0.1)',
        color: theme.palette.maskColor.warn,
    },
}))

export const Confirm = memo(function Confirm() {
    const { classes, cx, theme } = useStyles()
    const navigate = useNavigate()
    const { fromToken, toToken, quote, chainId, disabledDexIds } = useSwap()

    const { data: liquidityRes } = useLiquidityResources(chainId)
    const liquidityList = liquidityRes?.code === '0' ? liquidityRes.data : EMPTY_LIST
    const dexIdsCount = liquidityList.filter((x) => !disabledDexIds.includes(x.id)).length

    const [forwardCompare, setForwardCompare] = useState(true)
    const [baseToken, targetToken] =
        forwardCompare ? [quote?.fromToken, quote?.toToken] : [quote?.toToken, quote?.fromToken]
    const rate =
        quote ?
            forwardCompare && quote ?
                dividedBy(quote.toTokenAmount, quote.fromTokenAmount)
            :   dividedBy(quote.fromTokenAmount, quote.toTokenAmount)
        :   null

    const rateNode =
        baseToken && targetToken ?
            <>
                1 {baseToken.tokenSymbol} ≈ {formatCompact(rate!.toNumber())} {targetToken.tokenSymbol}
                <Icons.Cached
                    size={16}
                    color={theme.palette.maskColor.main}
                    onClick={() => setForwardCompare((v) => !v)}
                />
            </>
        :   null

    return (
        <div className={classes.container}>
            <div className={classes.pair}>
                <div className={classes.token}>
                    <Typography>From</Typography>
                    <div className={classes.tokenInfo}>
                        <TokenIcon
                            className={classes.tokenIcon}
                            chainId={fromToken?.chainId}
                            address={fromToken?.address || ''}
                            logoURL={fromToken?.logoURL}
                        />
                        <div className={classes.tokenValue}>
                            <Typography>-0.99293 USDC.e3</Typography>
                            <Typography>Polygon</Typography>
                        </div>
                    </div>
                </div>
                <div className={classes.token}>
                    <Typography>To</Typography>
                    <div className={classes.tokenInfo}>
                        <TokenIcon
                            className={classes.tokenIcon}
                            chainId={toToken?.chainId}
                            address={toToken?.address || ''}
                            logoURL={toToken?.logoURL}
                        />
                        <div className={classes.tokenValue}>
                            <Typography>-0.99293 USDC.e3</Typography>
                            <Typography>Polygon</Typography>
                        </div>
                    </div>
                </div>
            </div>
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
                    {dexIdsCount}/liquidityList.length
                    <Icons.ArrowRight size={20} />
                </Typography>
            </div>
            <div className={classes.infoRow}>
                <Typography className={classes.rowName}>
                    Quote route
                    <Icons.Questions size={16} />
                </Typography>
                <Typography className={classes.rowValue}>
                    🎉1.24
                    <Icons.ArrowRight />
                </Typography>
            </div>
            <div className={classes.infoRow}>
                <Typography className={classes.rowName}>
                    Powered by
                    <Icons.Questions size={16} />
                </Typography>
                <Typography className={classes.rowValue}>OKX</Typography>
            </div>

            <Typography className={classes.warning}>
                <Icons.WarningTriangle />
                Quote expired. Update to receive a new quote.
            </Typography>
        </div>
    )
})
