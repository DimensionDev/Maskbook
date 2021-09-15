import { memo } from 'react'
import formatDateTime from 'date-fns/format'
import type { Transaction } from '@masknet/web3-shared'
import { Box, TableCell, TableRow, Typography, Link } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    DebankTransactionDirection,
    formatKeccakHash,
    resolveLinkOnExplorer,
    useChainId,
    ZerionTransactionDirection,
} from '@masknet/web3-shared'
import { TransactionIcon } from '../TransactionIcon'
import { LinkOutIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import classNames from 'classnames'
import { upperFirst } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    type: {
        marginLeft: 14,
    },
    cell: {
        padding: '16px 28px',
        border: 'none',
        fontSize: theme.typography.pxToRem(14),
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: MaskColorVar.textPrimary,
    },
    linkIcon: {
        fill: 'none',
        fontSize: 20,
        marginLeft: 10,
    },
    pair: {
        color: MaskColorVar.greenMain,
    },
    send: {
        color: MaskColorVar.redMain,
    },
}))

export interface HistoryTableRowProps {
    transaction: Transaction
}

export const HistoryTableRow = memo<HistoryTableRowProps>(({ transaction }) => {
    const chainId = useChainId()
    return <HistoryTableRowUI transaction={transaction} chainId={chainId} />
})

export interface HistoryTableRowUIProps extends HistoryTableRowProps {
    chainId: ChainId
}

export const HistoryTableRowUI = memo<HistoryTableRowUIProps>(({ transaction, chainId }) => {
    const { classes } = useStyles()
    return (
        <TableRow>
            <TableCell className={classes.cell} align="center" variant="body">
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <TransactionIcon
                        transactionType={transaction.transactionType}
                        type={transaction.type}
                        address={transaction.toAddress}
                        failed={transaction.failed}
                    />
                    <Typography className={classes.type}>
                        {upperFirst((transaction.type ?? '').replace(/_/g, ' '))}
                    </Typography>
                </Box>
            </TableCell>
            <TableCell className={classes.cell} align="center">
                {transaction.pairs.map((pair, index) => {
                    const direction =
                        pair.direction === DebankTransactionDirection.SEND ||
                        pair.direction === ZerionTransactionDirection.OUT
                    return (
                        <div key={index} className={classNames(classes.pair, { [classes.send]: direction })}>
                            <span>{direction ? '-' : '+'}</span>
                            <span>{pair.amount.toFixed(pair.amount < 1 ? 6 : 2)}</span>
                            <span style={{ color: MaskColorVar.textPrimary, marginLeft: 10 }}>{pair.symbol}</span>
                        </div>
                    )
                })}
            </TableCell>
            <TableCell className={classes.cell} align="center">
                <Typography fontSize="inherit">{formatDateTime(transaction.timeAt, 'yyyy-MM-dd HH:mm')}</Typography>
            </TableCell>
            <TableCell className={classes.cell} align="center">
                <Link href={`${resolveLinkOnExplorer(chainId)}/tx/${transaction.id}`} className={classes.link}>
                    <span>{formatKeccakHash(transaction.id, 5)}</span>
                    <LinkOutIcon className={classes.linkIcon} />
                </Link>
            </TableCell>
        </TableRow>
    )
})
