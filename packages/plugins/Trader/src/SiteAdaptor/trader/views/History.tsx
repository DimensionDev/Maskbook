import { t } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { LoadingStatus, TokenIcon } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useAccount, useNetworks } from '@masknet/web3-hooks-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { Box, Typography } from '@mui/material'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import urlcat from 'urlcat'
import { RoutePaths } from '../../constants.js'
import { useTradeHistory } from '../../storage.js'
import { useRuntime } from '../contexts/RuntimeProvider.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        gap: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
        paddingBottom: theme.spacing(1.5),
        contentVisibility: 'auto',
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
    statusBox: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(2),
        padding: theme.spacing(2, 4),
    },
    statusIcon: {
        color: theme.palette.maskColor.main,
    },
    statusMessage: {
        fontSize: 18,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    statusNote: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
}))

export function HistoryView() {
    const { classes, theme } = useStyles()
    const { basepath } = useRuntime()
    const address = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { data: history = EMPTY_LIST, isLoading } = useTradeHistory(address)
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    if (isLoading) {
        return (
            <div className={classes.statusBox}>
                <LoadingStatus />
            </div>
        )
    }

    if (!history.length) {
        return (
            <Box className={classes.statusBox}>
                <Icons.EmptySimple className={classes.statusIcon} size={24} color={theme.palette.maskColor.main} />
                <Typography className={classes.statusMessage}>{t`No recent transactions`}</Typography>
                <Typography className={classes.statusNote}>
                    {t`Transaction history is only stored locally and will be deleted if you clear your browser data.`}
                </Typography>
            </Box>
        )
    }

    return (
        <div className={classes.container} no-scrollbar>
            {history.map((tx) => {
                const { fromToken, toToken, fromTokenAmount, toTokenAmount } = tx
                const chainId = tx.kind === 'swap' || !tx.kind ? tx.chainId : tx.fromChainId
                const network = networks.find((x) => +x.chainId === chainId)
                const toNetwork = tx.kind === 'bridge' ? networks.find((x) => x.chainId === tx.toChainId) : null
                const url = urlcat(basepath, RoutePaths.Transaction, { hash: tx.hash, chainId, mode: tx.kind })
                return (
                    <div className={classes.group} key={tx.hash}>
                        <div className={classes.groupHeader}>
                            <Typography className={classes.date}>{format(tx.timestamp, 'MM/dd/yyyy')}</Typography>
                            <Typography className={classes.time}>{format(tx.timestamp, 'hh:mm aa')}</Typography>
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
                                    {toNetwork ?
                                        <Typography className={classes.network}>
                                            {`${network?.fullName ?? '--'} to ${toNetwork.fullName ?? '--'}`}
                                        </Typography>
                                    :   <Typography className={classes.network}>{network?.fullName ?? '--'}</Typography>
                                    }
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
