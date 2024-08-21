import { Icons } from '@masknet/icons'
import { CopyButton, EthereumBlockie } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { leftShift } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Tooltip, Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { useMemo } from 'react'
import { useRSS3Trans } from '../../../locales/i18n_generated.js'
import { FeedActions } from '../../components/FeedActions/index.js'
import { formatTimestamp, ONE_WEEK } from '../../components/share.js'

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
    const t = useRSS3Trans()
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
                {t.transaction_details()}
            </Typography>
            <div className={classes.group}>
                <Box className={classes.field} style={{ alignItems: 'flex-start' }}>
                    <Typography className={classes.key}>{t.hash()}</Typography>
                    <Typography
                        className={classes.value}
                        component="div"
                        style={{ display: 'block', color: theme.palette.maskColor.second, marginLeft: 4 }}>
                        {feed.id}
                        <CopyButton text={feed.id} size={20} />
                    </Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>{t.status()}</Typography>
                    <Typography className={classes.value}>
                        <span className={classes.tag}>{feed.success ? t.successful() : t.failed()}</span>
                    </Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>{t.timestamp()}</Typography>
                    <Typography className={classes.value}>{timestamp}</Typography>
                </Box>
                <Box className={classes.field}>
                    <Typography className={classes.key}>{t.network()}</Typography>
                    <Typography className={classes.value}>
                        <span className={classes.tag}>{feed.network}</span>
                    </Typography>
                </Box>
                {feed.platform ?
                    <Box className={classes.field}>
                        <Typography className={classes.key}>{t.platform()}</Typography>
                        <Typography className={classes.value}>
                            <span className={classes.tag}>{feed.platform}</span>
                        </Typography>
                    </Box>
                :   null}
                <Box className={classes.field}>
                    <Typography className={classes.key}>{t.category()}</Typography>
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
                <Typography className={classes.key}>{t.from()}</Typography>
                <Tooltip title={feed.from}>
                    <Typography className={classes.value} gap={10} component="div">
                        <EthereumBlockie address={feed.from} classes={{ icon: classes.blockieIcon }} />
                        {formatEthereumAddress(feed.from, 4)}
                        <CopyButton text={feed.from} size={20} />
                    </Typography>
                </Tooltip>
            </Box>
            <Box className={classes.field}>
                <Typography className={classes.key}>{t.to()}</Typography>
                <Tooltip title={feed.to}>
                    <Typography className={classes.value} gap={10} component="div">
                        <EthereumBlockie address={feed.to} classes={{ icon: classes.blockieIcon }} />
                        {formatEthereumAddress(feed.to, 4)}
                        <CopyButton text={feed.to} size={20} />
                    </Typography>
                </Tooltip>
            </Box>
            <Box className={classes.sep} />
            <Box className={classes.field} style={{ alignItems: 'flex-start' }}>
                <Typography className={classes.key}>{t.actions({ count: feed.actions.length })}</Typography>
                <Typography className={classes.value} component="div">
                    <FeedActions feed={feed} />
                </Typography>
            </Box>
            {feed.fee ?
                <>
                    <Box className={classes.sep} />
                    <Box className={classes.field}>
                        <Typography className={classes.key}>{t.tx_fee()}</Typography>
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
