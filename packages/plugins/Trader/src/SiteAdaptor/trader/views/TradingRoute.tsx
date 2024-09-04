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
        padding: theme.spacing(0, 2),
        boxSizing: 'border-box',
        gap: theme.spacing(1),
    },
    tokenIcon: {
        height: 30,
        width: 30,
    },
    token: {
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing('8px', '6px'),
        borderRadius: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    pool: {
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1.5),
        fontSize: 13,
        fontWeight: 400,
        color: theme.palette.maskColor.main,
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
                            return (
                                <div key={`${route.router}/${index}`}>
                                    <div className={classes.token}>
                                        <TokenIcon
                                            className={classes.tokenIcon}
                                            chainId={chainId}
                                            address={subRoute.fromToken.tokenContractAddress}
                                        />
                                        {subRoute.dexProtocol.percent}%
                                    </div>
                                    <Icons.ArrowDrop size={20} />
                                    <Typography className={classes.pool}>{subRoute.dexProtocol.dexName}</Typography>
                                    <Icons.ArrowDrop size={20} />
                                    <Typography className={classes.pool}>{subRoute.dexProtocol.dexName}</Typography>
                                    <Icons.ArrowDrop size={20} />
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        chainId={chainId}
                                        address={subRoute.toToken.tokenContractAddress}
                                    />
                                </div>
                            )
                        })}
                    </Fragment>
                )
            })}
        </div>
    )
})
