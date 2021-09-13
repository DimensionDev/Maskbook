import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../../hooks/useWalletContext'
import type { TransactionRecord } from '../../../../../../plugins/Wallet/database/types'
import { CircularProgress, Link, List, ListItem, ListItemText } from '@material-ui/core'
import { Check, XCircle } from 'react-feather'
import {
    ChainId,
    formatKeccakHash,
    resolveTransactionLinkOnExplorer,
    TransactionStatusType,
    useChainId,
} from '@masknet/web3-shared'
import { ArrowRightIcon } from '@masknet/icons'

const useStyles = makeStyles()({
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
    },
    item: {
        padding: 14,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
    },
    arrow: {
        stroke: '#15181B',
        fill: 'none',
        fontSize: 20,
    },
    icon: {
        width: 20,
        height: 20,
    },
})

export const ActivityList = memo(() => {
    const { transactions } = useContainer(WalletContext)
    const chainId = useChainId()
    return <ActivityListUI dataSource={transactions ?? []} chainId={chainId} />
})

export interface ActivityListUIProps {
    dataSource: TransactionRecord[]
    chainId: ChainId
}

export const ActivityListUI = memo<ActivityListUIProps>(({ dataSource, chainId }) => {
    const { classes } = useStyles()

    return (
        <List dense className={classes.list}>
            {dataSource.map((transaction, index) => (
                <Link
                    href={resolveTransactionLinkOnExplorer(chainId, transaction.hash)}
                    target="_blank"
                    rel="noopener noreferrer">
                    <ListItem key={index} className={classes.item}>
                        {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                            <CircularProgress size={20} color="primary" />
                        ) : transaction.status === TransactionStatusType.SUCCEED ? (
                            <Check size={20} color="#77E0B5" />
                        ) : (
                            <XCircle size={20} color="#FF5555" />
                        )}
                        <ListItemText style={{ marginLeft: 15 }}>{formatKeccakHash(transaction.hash, 6)}</ListItemText>
                        <ArrowRightIcon className={classes.arrow} style={{ fill: 'none' }} />
                    </ListItem>
                </Link>
            ))}
        </List>
    )
})
