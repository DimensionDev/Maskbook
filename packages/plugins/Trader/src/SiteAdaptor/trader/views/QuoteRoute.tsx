import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useSwap } from '../contexts/index.js'
import { RoutePaths } from '../../constants.js'

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

export const QuoteRoute = memo(function QuoteRoute() {
    const { classes } = useStyles()
    const { quote } = useSwap()

    return (
        <div className={classes.container}>
            <div className={classes.infoRow}>
                <Typography className={classes.rowName}>Dex/Est received ({quote?.toToken.tokenSymbol})</Typography>
                <Typography className={classes.rowValue}>
                    Rank
                    <ShadowRootTooltip title="This is the price difference between the DEX with the highest composite price and other DEXs, which factors in the estimated received amount and network fee.">
                        <Icons.Questions />
                    </ShadowRootTooltip>
                </Typography>
            </div>
            {quote?.quoteCompareList.map((compare, index) => {
                const isBest = index === 0
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
                            <Typography className={classes.rowName}>{compare.amountOut}</Typography>
                            {isBest ?
                                <div className={classes.rowValue}>
                                    <Typography className={classes.highlight}>Best</Typography>
                                </div>
                            :   null}
                        </div>
                        <div className={classes.tags}>
                            <Typography className={classes.tag}>
                                <Icons.Gas size={16} />${compare.tradeFee}
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
