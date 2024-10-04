import { Icons } from '@masknet/icons'
import { CopyButton, EthereumBlockie, ReversedAddress } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { leftShift } from '@masknet/web3-shared-base'
import { Box, Tooltip, Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { useMemo } from 'react'
import { FeedActions } from '../../components/FeedActions/index.js'
import { formatTimestamp, ONE_WEEK } from '../../components/share.js'
import { Plural, Trans } from '@lingui/macro'

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
    feed: RSS3BaseAPI.Web3Feed
}

export function TxDetails({ feed }: TxDetailsProps) {
    const { classes, theme } = useStyles()

    const timestamp = useMemo(() => {
        const date = new Date(feed.timestamp)
        const ms = date.getTime()
        const distance = Date.now() - ms
        const formatted = formatDateTime(feed.timestamp * 1000, 'MMM dd, yyyy HH:mm:ss')
        if (distance > ONE_WEEK) return formatted
        const timeAgo = formatTimestamp(feed.timestamp)
        return `${formatTimestamp} ${timeAgo}`
    }, [feed.timestamp])

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
                        {feed.id}
                        <CopyButton text={feed.id} size={20} />
                    </Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>
                        <Trans>Status</Trans>
                    </Typography>
                    <Typography className={classes.value}>
                        <span className={classes.tag}>
                            {feed.success ?
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
                        <span className={classes.tag}>{feed.network}</span>
                    </Typography>
                </Box>
                {feed.platform ?
                    <Box className={classes.field}>
                        <Typography className={classes.key}>
                            <Trans>Platform</Trans>
                        </Typography>
                        <Typography className={classes.value}>
                            <span className={classes.tag}>{feed.platform}</span>
                        </Typography>
                    </Box>
                :   null}
                <Box className={classes.field}>
                    <Typography className={classes.key}>
                        <Trans>Category</Trans>
                    </Typography>
                    <Typography className={classes.value} component="div">
                        <div className={classes.tags}>
                            <span className={classes.tag}>{feed.tag}</span>
                            <span className={classes.tag}>{feed.type}</span>
                        </div>
                    </Typography>
                </Box>
            </div>
            <Box className={classes.sep} />
            <Box className={classes.field}>
                <Typography className={classes.key}>
                    <Trans>From</Trans>
                </Typography>
                <Tooltip title={feed.from}>
                    <Typography className={classes.value} gap={10} component="div">
                        <EthereumBlockie address={feed.from} classes={{ icon: classes.blockieIcon }} />
                        <ReversedAddress address={feed.from} fontWeight={400} />
                        <CopyButton text={feed.from} size={20} />
                    </Typography>
                </Tooltip>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.key}>
                    <Trans>To</Trans>
                </Typography>
                <Tooltip title={feed.to}>
                    <Typography className={classes.value} gap={10} component="div">
                        <EthereumBlockie address={feed.to} classes={{ icon: classes.blockieIcon }} />
                        <ReversedAddress address={feed.to} fontWeight={400} />
                        <CopyButton text={feed.to} size={20} />
                    </Typography>
                </Tooltip>
            </Box>
            <Box className={classes.sep} />
            <Box className={classes.field} style={{ alignItems: 'flex-start' }}>
                <Typography className={classes.key}>
                    <Plural one="Action" other="Actions" value={feed.actions.length} />
                </Typography>
                <Typography className={classes.value} component="div">
                    <FeedActions feed={feed} />
                </Typography>
            </Box>
            {feed.fee ?
                <>
                    <Box className={classes.sep} />
                    <Box className={classes.field}>
                        <Typography className={classes.key}>
                            <Trans>Tx Fee</Trans>
                        </Typography>
                        <Typography className={classes.value}>
                            {leftShift(feed.fee.amount, feed.fee.decimal).toFixed(6)}
                            <Icons.Gas size={16} />
                        </Typography>
                    </Box>
                </>
            :   null}
        </Box>
    )
}
