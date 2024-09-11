import { EmptyStatus, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Fragment, memo } from 'react'
import { useSwap } from '../contexts/index.js'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing(2),
        boxSizing: 'border-box',
        gap: theme.spacing(1),
    },
    route: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    tokenIcon: {
        height: 30,
        width: 30,
    },
    arrow: {
        transform: 'rotate(-90deg)',
        color: theme.palette.maskColor.second,
    },
    token: {
        backgroundColor: theme.palette.maskColor.bg,
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing('8px', '6px'),
        borderRadius: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    pool: {
        flexGrow: 1,
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1.5),
        fontSize: 13,
        fontWeight: 400,
        color: theme.palette.maskColor.main,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
}))

export const TradingRoute = memo(function TradingRoute() {
    const { classes } = useStyles()
    const { quote } = useSwap()

    if (!quote) return <EmptyStatus />
    const chainId = Number.parseInt(quote.chainId, 10)

    return (
        <div className={classes.container}>
            {quote?.dexRouterList.map((route) => {
                return (
                    <Fragment key={route.router}>
                        {route.subRouterList.map((subRoute, index) => {
                            const fromPool = subRoute.dexProtocol[0]
                            const toPool = subRoute.dexProtocol[1] || fromPool
                            return (
                                <div key={`${route.router}/${index}`} className={classes.route}>
                                    <Typography className={classes.token} component="div">
                                        <TokenIcon
                                            className={classes.tokenIcon}
                                            chainId={chainId}
                                            address={subRoute.fromToken.tokenContractAddress}
                                        />
                                        {fromPool.percent}%
                                    </Typography>
                                    <Icons.ArrowDrop className={classes.arrow} size={20} />
                                    <Typography className={classes.pool}>{fromPool.dexName}</Typography>
                                    <Icons.ArrowDrop className={classes.arrow} size={20} />
                                    <Typography className={classes.pool}>{toPool.dexName}</Typography>
                                    <Icons.ArrowDrop className={classes.arrow} size={20} />
                                    <div className={classes.token}>
                                        <TokenIcon
                                            className={classes.tokenIcon}
                                            chainId={chainId}
                                            address={subRoute.toToken.tokenContractAddress}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </Fragment>
                )
            })}
        </div>
    )
})
