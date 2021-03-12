import { TableRow, TableCell } from '@material-ui/core'
import type { FC } from 'react'
import type { Transaction } from './types'

interface Props {
    transaction: Transaction
}

export const Row: FC<Props> = ({ transaction }) => (
    <TableRow>
        <TableCell>
            <section>{transaction.timeAt.toLocaleString()}</section>
            <Address id={transaction.id} />
        </TableCell>
        <TableCell>
            <section>{transaction.type}</section>
            <Address id={transaction.toAddress} />
        </TableCell>
        <TableCell>
            {transaction.pairs.map((pair, index) => (
                <section key={index}>
                    <span>{pair.direction === 'send' ? '-' : '+'}</span>
                    <span>{pair.amount.toFixed(4)}</span>
                    <span title={pair.name}>{pair.symbol}</span>
                </section>
            ))}
        </TableCell>
        <TableCell>
            <section>Gas fee</section>
            <section>
                <span>{transaction.gasFee.eth.toFixed(4)} ETH</span>
                <span>({transaction.gasFee.usd.toFixed(2)} USD)</span>
            </section>
        </TableCell>
    </TableRow>
)

const Address: FC<{ id: string | undefined }> = ({ id }) => (
    <a target={id} href={`https://etherscan.io/tx/${id}`}>
        <span>{id?.slice(0, 5)}</span>
        <span>...</span>
        <span>{id?.slice(id.length - 5)}</span>
    </a>
)
