import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useSwap } from '../contexts/index.js'
import { Icons } from '@masknet/icons'
import { range } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        gap: theme.spacing(1.5),
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
        paddingBottom: theme.spacing(1.5),
    },
    groupHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        color: theme.palette.maskColor.main,
    },
    date: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
    },
    time: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
    },
    tokenIcons: {
        display: 'flex',
    },
    symbol: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        fontSize: 14,
    },
    toTokenIcon: {
        marginLeft: -12,
    },
    direction: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    directionIcon: {
        transform: 'rotate(90deg)',
    },
    network: {
        fontSize: 13,
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    result: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'auto',
    },
    received: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
        color: theme.palette.maskColor.success,
    },
    sent: {
        fontSize: 13,
        fontWeight: 400,
        lineHeight: '18px',
    },
    records: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
    record: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
}))

export function HistoryView() {
    const { classes, theme } = useStyles()
    const { fromToken, toToken } = useSwap()
    return (
        <div className={classes.container}>
            <div className={classes.group}>
                <div className={classes.groupHeader}>
                    <Typography className={classes.date}>07/23/2024</Typography>
                    <Typography className={classes.time}>3:59 PM</Typography>
                </div>
                <div className={classes.records}>
                    {range(8).map((i) => (
                        <div className={classes.record} key={i}>
                            <div className={classes.tokenIcons}>
                                <TokenIcon address={fromToken?.address ?? ''} size={30} />
                                <TokenIcon className={classes.toTokenIcon} address={toToken?.address ?? ''} size={30} />
                            </div>
                            <div>
                                <div className={classes.direction}>
                                    <Typography className={classes.symbol}>USDC</Typography>
                                    <Icons.CallSend
                                        className={classes.directionIcon}
                                        size={16}
                                        color={theme.palette.text.secondary}
                                    />
                                    <Typography className={classes.symbol}>USDC</Typography>
                                </div>
                                <Typography className={classes.network}>Polygon</Typography>
                            </div>
                            <div className={classes.result}>
                                <Typography className={classes.received}>+0.999 USDT</Typography>
                                <Typography className={classes.sent}>-1USDC</Typography>
                            </div>
                            <Icons.ArrowRight size={16} color={theme.palette.maskColor.main} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
