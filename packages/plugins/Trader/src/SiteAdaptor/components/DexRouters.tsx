import { Icons } from '@masknet/icons'
import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { SubRouter } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { Fragment, memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    route: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
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
        gap: theme.spacing(0.5),
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

interface Props {
    percent: string
    chainId: number
    routers: SubRouter[]
}

export const DexRouters = memo<Props>(function DexRouters({ chainId, percent, routers }) {
    const { classes } = useStyles()
    const startSubRoute = routers.at(0)
    const endSubRoute = routers.at(-1)
    const middleSubRoutes = routers.slice(1, -1)
    return (
        <div className={classes.route}>
            <Typography className={classes.token} component="div">
                <TokenIcon size={30} chainId={chainId} address={startSubRoute!.fromToken.tokenContractAddress} />
                {percent}%
            </Typography>
            {middleSubRoutes.map((subRouter) => {
                return (
                    <Fragment key={subRouter.fromToken.tokenContractAddress}>
                        <Icons.ArrowDrop className={classes.arrow} size={20} />
                        <Typography className={classes.pool}>{subRouter.dexProtocol[0].dexName}</Typography>
                    </Fragment>
                )
            })}
            <Icons.ArrowDrop className={classes.arrow} size={20} />
            <div className={classes.token}>
                <TokenIcon size={30} chainId={chainId} address={endSubRoute!.toToken.tokenContractAddress} />
            </div>
        </div>
    )
})
