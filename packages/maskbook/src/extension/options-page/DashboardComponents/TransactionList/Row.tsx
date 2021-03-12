import { createStyles, Link, makeStyles, TableCell, TableRow, Typography } from '@material-ui/core'
import type { FC } from 'react'
import { Record } from './Record'
import type { Transaction } from './types'

interface Props {
    transaction: Transaction
}

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
        },
    }),
)

export const Row: FC<Props> = ({ transaction }) => {
    const 
    return (
        <TableRow>
            <TableCell>
                <Typography color="textSecondary">{transaction.timeAt.toLocaleString()}</Typography>
                <Address id={transaction.id} />
            </TableCell>
            <TableCell>
                <Typography color="textSecondary">{transaction.type}</Typography>
                <Address id={transaction.toAddress} />
            </TableCell>
            <TableCell>
                {transaction.pairs.map((pair, index) => (
                    <Record pair={pair} key={index} />
                ))}
            </TableCell>
            <TableCell>
                <Typography color="textSecondary">Gas fee</Typography>
                <Typography>{transaction.gasFee.eth.toFixed(4)} ETH</Typography>
                <Typography color="textSecondary">{transaction.gasFee.usd.toFixed(2)} USD</Typography>
            </TableCell>
        </TableRow>
    )
}

const Address: FC<{ id: string | undefined }> = ({ id }) => (
    <Link target={id} href={`https://etherscan.io/tx/${id}`}>
        <span>{id?.slice(0, 5)}</span>
        <span>...</span>
        <span>{id?.slice(id.length - 5)}</span>
    </Link>
)
