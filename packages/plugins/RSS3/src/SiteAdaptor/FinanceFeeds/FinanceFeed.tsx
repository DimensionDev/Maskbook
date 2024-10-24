import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { formatTimestamp } from '../components/share.js'
import { type Transaction } from '@masknet/web3-shared-base'
import { format as formatDateTime } from 'date-fns'
import { memo, type HTMLProps } from 'react'
import { NetworkIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { Typography } from '@mui/material'
import { FeedSummary } from './FeedSummary.js'

const useStyles = makeStyles()((theme) => ({
    verbose: {},
    inspectable: {
        cursor: 'pointer',
        padding: theme.spacing(1.5),
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    timestamp: {
        fontSize: 14,
        fontWeight: 400,
        color: theme.palette.maskColor.third,
    },
    body: {},
}))

export interface FinanceFeedProps extends HTMLProps<HTMLDivElement> {
    transaction: Transaction<ChainId, SchemaType>
    verbose?: boolean
}
export const FinanceFeed = memo<FinanceFeedProps>(function FinanceFeed({ transaction, verbose, className, ...rest }) {
    const { classes, cx } = useStyles()
    return (
        <article
            {...rest}
            className={cx(className, verbose ? classes.verbose : classes.inspectable)}
            onClick={() => {
                //
            }}>
            <div className={classes.header}>
                <NetworkIcon pluginID={NetworkPluginID.PLUGIN_EVM} chainId={transaction.chainId} size={18} />
                {transaction.timestamp ?
                    <ShadowRootTooltip
                        title={formatDateTime(new Date(transaction.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                        placement="right">
                        <Typography className={classes.timestamp}>{formatTimestamp(transaction.timestamp)}</Typography>
                    </ShadowRootTooltip>
                :   null}
            </div>
            <FeedSummary transaction={transaction} mt={0.5} />
            <div className={classes.body}>
                {transaction.type}
                {transaction.cateName}
            </div>
        </article>
    )
})
