import { TableRow, TableCell } from '@material-ui/core'
import type { FC } from 'react'
import type { Transaction } from './types'

interface Props {
    transaction: Transaction
}

export const Row: FC<Props> = ({ transaction }) => {
    return (
        <TableRow>
            <TableCell>{transaction.id}</TableCell>
        </TableRow>
    )
}
