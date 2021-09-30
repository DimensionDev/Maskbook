import { memo } from 'react'
import formatDateTime from 'date-fns/format'
import type { Transaction } from '@masknet/web3-shared'
import { Box, TableCell, TableRow, Typography, Link, Stack } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    DebankTransactionDirection,
    formatEthereumAddress,
    resolveTransactionLinkOnExplorer,
    useChainId,
    ZerionTransactionDirection,
} from '@masknet/web3-shared'
import { TransactionIcon } from '../TransactionIcon'
import { LinkOutIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    type: {
        maxWidth: '240px',
        textOverflow: 'ellipsis',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    cell: {
        padding: `${theme.spacing(1.25)} ${theme.spacing(2.5)}`,
        border: 'none',
        fontSize: theme.typography.pxToRem(14),
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 21,
        color: MaskColorVar.textPrimary,
    },
    linkIcon: {
        fill: 'none',
        fontSize: 16,
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
                    <Stack pl={2}>
                        <Typography textAlign="left" className={classes.type} variant="body2">
                            {(transaction.type ?? '').replace(/_/g, ' ')}
                        </Typography>
                        <Typography fontSize={12} color={MaskColorVar.textSecondary}>
                            {formatDateTime(transaction.timeAt, 'yyyy-MM-dd HH:mm')}
                        </Typography>
                    </Stack>
                </Box>
            </TableCell>
            <TableCell className={classes.cell} align="center">
                {transaction.pairs.map((pair, index) => {
                    const direction =
                        pair.direction === DebankTransactionDirection.SEND ||
                        pair.direction === ZerionTransactionDirection.OUT
                    return (
                        <Stack
                            key={index}
                            className={classNames(classes.pair, { [classes.send]: direction })}
                            justifyContent="center"
                            gap={2}
                            direction="row">
                            <Box width="50%" flexGrow={0} flexShrink={0} textAlign="right">
                                <span>{direction ? '-' : '+'}</span>
                                <span>{pair.amount.toFixed(pair.amount < 1 ? 6 : 2)}</span>
                            </Box>
                            <Box width="50%" flexGrow={0} flexShrink={0} textAlign="left">
                                <Typography variant="body2" color={MaskColorVar.textPrimary}>
                                    {pair.symbol}
                                </Typography>
                            </Box>
                        </Stack>
                    )
                })}
            </TableCell>
            {/*<TableCell className={classes.cell} align="center"></TableCell>*/}
            <TableCell className={classes.cell} align="center">
                <Box className={classes.link}>
                    <Typography variant="body2">{formatEthereumAddress(transaction.toAddress, 4)}</Typography>
                    <Link
                        sx={{ height: 21 }}
                        href={resolveTransactionLinkOnExplorer(chainId, transaction.id)}
                        target="_blank"
                        rel="noopener noreferrer">
                        <LinkOutIcon className={classes.linkIcon} />
                    </Link>
                </Box>
            </TableCell>
        </TableRow>
    )
})
