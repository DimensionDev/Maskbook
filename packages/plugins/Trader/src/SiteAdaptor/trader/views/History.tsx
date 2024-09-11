import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useSwapHistory } from '../../storage.js'
import { useNetworks } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { Link } from 'react-router-dom'
import urlcat from 'urlcat'
import { RoutePaths } from '../../constants.js'
import { format } from 'date-fns'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        gap: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
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
        color: theme.palette.maskColor.main,
        textAlign: 'right',
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
        textDecoration: 'none',
    },
}))

export function HistoryView() {
    const { classes, theme } = useStyles()
    const history = useSwapHistory()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    return (
        <div className={classes.container}>
            {history.map((tx) => {
                const { fromToken, toToken, chainId, fromTokenAmount, toTokenAmount } = tx
                const network = networks.find((x) => x.chainId === chainId)
                const url = urlcat(RoutePaths.Transaction, { hash: tx.hash, chainId: tx.chainId })
                return (
                    <div className={classes.group} key={tx.hash}>
                        <div className={classes.groupHeader}>
                            <Typography className={classes.date}>{format(tx.datetime, 'MM/dd/yyyy')}</Typography>
                            <Typography className={classes.time}>{format(tx.datetime, 'hh:mm aa')}</Typography>
                        </div>
                        <div className={classes.records}>
                            <Link className={classes.record} key={tx.hash} to={url}>
                                <div className={classes.tokenIcons}>
                                    <TokenIcon
                                        chainId={fromToken.chainId}
                                        address={fromToken.contractAddress}
                                        logoURL={fromToken.logo}
                                        size={30}
                                    />
                                    <TokenIcon
                                        className={classes.toTokenIcon}
                                        chainId={toToken.chainId}
                                        address={toToken.contractAddress}
                                        logoURL={toToken.logo}
                                        size={30}
                                    />
                                </div>
                                <div>
                                    <div className={classes.direction}>
                                        <Typography className={classes.symbol}>{fromToken.symbol}</Typography>
                                        <Icons.CallSend
                                            className={classes.directionIcon}
                                            size={16}
                                            color={theme.palette.text.secondary}
                                        />
                                        <Typography className={classes.symbol}>{toToken.symbol}</Typography>
                                    </div>
                                    <Typography className={classes.network}>{network?.name ?? '--'}</Typography>
                                </div>
                                <div className={classes.result}>
                                    <Typography className={classes.received}>
                                        {toTokenAmount ?
                                            `+${formatBalance(toTokenAmount, toToken.decimals)} ${toToken.symbol}`
                                        :   '--'}
                                    </Typography>
                                    <Typography className={classes.sent}>
                                        {fromTokenAmount ?
                                            `-${formatBalance(fromTokenAmount, fromToken.decimals)} ${fromToken.symbol}`
                                        :   '--'}
                                    </Typography>
                                </div>
                                <Icons.ArrowRight size={16} color={theme.palette.maskColor.main} />
                            </Link>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
