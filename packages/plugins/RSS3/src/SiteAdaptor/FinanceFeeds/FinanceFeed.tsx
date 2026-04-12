import { NetworkIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'
import type { Transaction } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { memo, type HTMLProps } from 'react'
import { formatTimestamp } from '../components/share.js'
import { useFeedOwner } from '../contexts/FeedOwnerContext.js'
import { FinanceFeedDetailsModal } from '../modals/modals.js'
import { FeedSummary } from './FeedSummary.js'

const useStyles = makeStyles()((theme) => ({
    verbose: {},
    canInspect: {
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
}))

export interface FinanceFeedProps extends HTMLProps<HTMLDivElement> {
    transaction: Transaction<ChainId, SchemaType>
    verbose?: boolean
}
export const FinanceFeed = memo<FinanceFeedProps>(function FinanceFeed({ transaction, verbose, className, ...rest }) {
    const { classes, cx } = useStyles()
    const feedOwner = useFeedOwner()
    const { map } = ScopedDomainsContainer.useContainer()
    return (
        <article
            {...rest}
            className={cx(className, verbose ? classes.verbose : classes.canInspect)}
            onClick={() => {
                if (verbose) return
                FinanceFeedDetailsModal.open({
                    scopedDomainsMap: map,
                    transaction,
                    feedOwner,
                })
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
        </article>
    )
})
