import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { CopyButton } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetwork } from '@masknet/web3-hooks-base'
import { TransactionStatusType, trimZero, type Transaction } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Box, Tooltip, Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { useMemo } from 'react'
import { formatTimestamp, ONE_WEEK } from '../../components/share.js'
import { AccountLabel } from '../../components/common.js'

const useStyles = makeStyles()((theme) => ({
    group: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    field: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
        gap: theme.spacing(3),
    },
    key: {
        color: theme.palette.text.secondary,
        fontSize: 14,
        width: 80,
    },
    value: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontSize: 14,
        wordBreak: 'break-all',
    },
    sep: {
        borderTop: `1px dashed ${theme.palette.maskColor.secondaryLine}`,
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        backgroundColor: theme.palette.divider,
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        margin: theme.spacing(3, 0),
    },
    tag: {
        padding: '4px 6px',
        borderRadius: 4,
        backgroundColor: theme.palette.maskColor.bg,
        fontSize: 13,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        textTransform: 'capitalize',
    },
}))

interface TxDetailsProps {
    transaction: Transaction<ChainId, SchemaType>
}

export function TxDetails({ transaction: tx }: TxDetailsProps) {
    const { classes, theme } = useStyles()

    const timestamp = useMemo(() => {
        const date = new Date(tx.timestamp)
        const ms = date.getTime()
        const distance = Date.now() - ms
        const formatted = formatDateTime(tx.timestamp * 1000, 'MMM dd, yyyy HH:mm:ss')
        if (distance > ONE_WEEK) return formatted
        const timeAgo = formatTimestamp(tx.timestamp)
        return timeAgo
    }, [tx.timestamp])

    const network = useNetwork(NetworkPluginID.PLUGIN_EVM, tx.chainId)

    return (
        <Box>
            <Typography className={classes.title}>
                <Icons.Approve size={24} />
                <Trans>Transaction Details</Trans>
            </Typography>
            <div className={classes.group}>
                <Box className={classes.field} style={{ alignItems: 'flex-start' }}>
                    <Typography className={classes.key}>
                        <Trans>Hash</Trans>
                    </Typography>
                    <Typography
                        className={classes.value}
                        component="div"
                        style={{ display: 'block', color: theme.palette.maskColor.second, marginLeft: 4 }}>
                        {tx.hash}
                        <CopyButton text={tx.hash!} size={20} />
                    </Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>
                        <Trans>Status</Trans>
                    </Typography>
                    <Typography className={classes.value}>
                        <span className={classes.tag}>
                            {tx.status === TransactionStatusType.SUCCEED ?
                                <Trans>Successful</Trans>
                            :   <Trans>Failed</Trans>}
                        </span>
                    </Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>
                        <Trans>Timestamp</Trans>
                    </Typography>
                    <Typography className={classes.value}>{timestamp}</Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>
                        <Trans>Network</Trans>
                    </Typography>
                    <Typography className={classes.value}>
                        <span className={classes.tag}>{network?.name}</span>
                    </Typography>
                </Box>
            </div>
            <Box className={classes.sep} />
            <Box className={classes.field}>
                <Typography className={classes.key}>
                    <Trans>From</Trans>
                </Typography>
                <Tooltip title={tx.from}>
                    <Typography className={classes.value} gap={10} component="div">
                        <AccountLabel address={tx.from} size={16} />
                        <CopyButton text={tx.from} size={20} />
                    </Typography>
                </Tooltip>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.key}>
                    <Trans>To</Trans>
                </Typography>
                <Tooltip title={tx.to}>
                    <Typography className={classes.value} gap={10} component="div">
                        <AccountLabel address={tx.to} size={16} /> <CopyButton text={tx.to} size={20} />
                    </Typography>
                </Tooltip>
            </Box>
            {tx.feeInfo ?
                <>
                    <Box className={classes.sep} />
                    <Box className={classes.field}>
                        <Typography className={classes.key}>
                            <Trans>Tx Fee</Trans>
                        </Typography>
                        <Typography className={classes.value}>
                            {trimZero(tx.feeInfo.amount)} {tx.feeInfo.symbol}
                            <Icons.Gas size={16} />
                        </Typography>
                    </Box>
                </>
            :   null}
        </Box>
    )
}
