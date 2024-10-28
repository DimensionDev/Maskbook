import { t } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { CopyButton, EthereumBlockie, ReversedAddress } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetwork } from '@masknet/web3-hooks-base'
import { TransactionStatusType, trimZero, type Transaction } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Box, Tooltip, Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { useMemo } from 'react'
import { formatTimestamp, ONE_WEEK } from '../../components/share.js'
import { FeedSummary } from '../../FinanceFeeds/FeedSummary.js'

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
    tags: {
        display: 'flex',
        gap: 10,
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
    blockieIcon: {
        height: 16,
        width: 16,
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
                {t`Transaction Details`}
            </Typography>
            <div className={classes.group}>
                <Box className={classes.field} style={{ alignItems: 'flex-start' }}>
                    <Typography className={classes.key}>{t`Hash`}</Typography>
                    <Typography
                        className={classes.value}
                        component="div"
                        style={{ display: 'block', color: theme.palette.maskColor.second, marginLeft: 4 }}>
                        {tx.hash}
                        <CopyButton text={tx.hash!} size={20} />
                    </Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>{t`Status`}</Typography>
                    <Typography className={classes.value}>
                        <span className={classes.tag}>
                            {tx.status === TransactionStatusType.SUCCEED ? t`Successful` : t`Failed`}
                        </span>
                    </Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>{t`Timestamp`}</Typography>
                    <Typography className={classes.value}>{timestamp}</Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>{t`Network`}</Typography>
                    <Typography className={classes.value}>
                        <span className={classes.tag}>{network?.name}</span>
                    </Typography>
                </Box>
            </div>
            <Box className={classes.sep} />
            <Box className={classes.field}>
                <Typography className={classes.key}>{t`From`}</Typography>
                <Tooltip title={tx.from}>
                    <Typography className={classes.value} gap={10} component="div">
                        <EthereumBlockie address={tx.from} classes={{ icon: classes.blockieIcon }} />
                        <ReversedAddress address={tx.from} fontWeight={400} />
                        <CopyButton text={tx.from} size={20} />
                    </Typography>
                </Tooltip>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.key}>{t`To`}</Typography>
                <Tooltip title={tx.to}>
                    <Typography className={classes.value} gap={10} component="div">
                        <EthereumBlockie address={tx.to} classes={{ icon: classes.blockieIcon }} />
                        <ReversedAddress address={tx.to} fontWeight={400} />
                        <CopyButton text={tx.to} size={20} />
                    </Typography>
                </Tooltip>
            </Box>
            <Box className={classes.sep} />
            <Box className={classes.field} style={{ alignItems: 'flex-start' }}>
                <Typography className={classes.key}>{t`Actions`}</Typography>
                <Typography className={classes.value} component="div">
                    <FeedSummary transaction={tx} mt={0.5} />
                </Typography>
            </Box>
            {tx.feeInfo ?
                <>
                    <Box className={classes.sep} />
                    <Box className={classes.field}>
                        <Typography className={classes.key}>{t`Tx Fee`}</Typography>
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
