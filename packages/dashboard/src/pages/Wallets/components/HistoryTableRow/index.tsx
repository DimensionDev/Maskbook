import { memo } from 'react'
import classNames from 'classnames'
import formatDateTime from 'date-fns/format'
import { Icon  } from '@masknet/icons'
import { useReverseAddress, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ChainId, DebankTransactionDirection, SchemaType, ZerionTransactionDirection } from '@masknet/web3-shared-evm'
import { Box, Link, Stack, TableCell, TableRow, Tooltip, Typography } from '@mui/material'
import { TransactionIcon } from '../TransactionIcon'
import { TokenType, Transaction } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'
import fromUnixTime from 'date-fns/fromUnixTime'

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
        // TODO: replace with theme color
        color: theme.palette.mode === 'dark' ? '#F5F5F5' : '#07101B',
        fontSize: 16,
        marginLeft: 10,
    },
    pair: {
        color: MaskColorVar.greenMain,
    },
    send: {
        color: MaskColorVar.redMain,
    },
    hover: {
        '&:hover': {
            backgroundColor: theme.palette.background.default,
        },
    },
    nftName: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'default',
    },
}))

export interface HistoryTableRowProps {
    transaction: Transaction<ChainId, SchemaType>
    selectedChainId: Web3Helper.ChainIdAll
}

export const HistoryTableRow = memo<HistoryTableRowProps>(({ transaction, selectedChainId }) => {
    const { value: domain } = useReverseAddress(undefined, transaction.to)

    const transactionType = (transaction.type ?? '').replace(/_/g, ' ')

    return (
        <HistoryTableRowUI
            transaction={transaction}
            formattedType={transactionType}
            selectedChainId={selectedChainId}
            domain={domain}
        />
    )
})

export interface HistoryTableRowUIProps extends HistoryTableRowProps {
    selectedChainId: Web3Helper.ChainIdAll
    formattedType: string
    domain?: string
}

export const HistoryTableRowUI = memo<HistoryTableRowUIProps>(
    ({ transaction, selectedChainId, formattedType, domain }) => {
        const { classes } = useStyles()
        const { Others } = useWeb3State()
        return (
            <TableRow className={classes.hover}>
                <TableCell className={classes.cell} align="center" variant="body">
                    <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <TransactionIcon
                            transactionType={transaction.type}
                            type={transaction.type}
                            address={transaction.to}
                            failed={transaction.status === 0}
                        />
                        <Stack pl={2}>
                            <Typography textAlign="left" className={classes.type} variant="body2">
                                {formattedType}
                            </Typography>
                            <Typography fontSize={12} textAlign="left" color={MaskColorVar.textSecondary}>
                                {formatDateTime(fromUnixTime(transaction.timestamp), 'yyyy-MM-dd HH:mm')}
                            </Typography>
                        </Stack>
                    </Box>
                </TableCell>
                <TableCell className={classes.cell} align="center">
                    {transaction.tokens.map((pair, index) => {
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
                                    <span>
                                        {new BigNumber(pair.amount).toFixed(
                                            new BigNumber(pair.amount).toNumber() < 1 ? 6 : 2,
                                        )}
                                    </span>
                                </Box>
                                <Box width="50%" flexGrow={0} flexShrink={0} textAlign="left">
                                    {pair.type === TokenType.NonFungible && (
                                        <Tooltip title={pair.name} arrow disableInteractive>
                                            <Typography
                                                className={classes.nftName}
                                                variant="body2"
                                                color={MaskColorVar.textPrimary}>
                                                {pair.name}
                                            </Typography>
                                        </Tooltip>
                                    )}
                                    {pair.type === TokenType.Fungible && (
                                        <Typography variant="body2" color={MaskColorVar.textPrimary}>
                                            {pair.symbol}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        )
                    })}
                </TableCell>
                <TableCell className={classes.cell} align="center">
                    <Box className={classes.link}>
                        <Typography variant="body2">
                            {domain ? Others?.formatDomainName?.(domain) : Others?.formatAddress?.(transaction.to, 4)}
                        </Typography>
                        <Link
                            sx={{ height: 21 }}
                            href={Others?.explorerResolver.transactionLink(selectedChainId, transaction.id)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icon type="linkOut" className={classes.linkIcon} />
                        </Link>
                    </Box>
                </TableCell>
            </TableRow>
        )
    },
)
