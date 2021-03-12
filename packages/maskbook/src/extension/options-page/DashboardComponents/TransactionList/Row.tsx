import { createStyles, Link, makeStyles, TableCell, TableRow, Typography } from '@material-ui/core'
import type { FC } from 'react'
import { Record } from './Record'
import type { Transaction } from './types'
import classNames from 'classnames'
import { isNil } from 'lodash-es'

interface Props {
    transaction: Transaction
}

const useStyles = makeStyles(() =>
    createStyles({
        failed: { opacity: 0.3 },
        hidden: { visibility: 'hidden' },
    }),
)

export const Row: FC<Props> = ({ transaction }) => {
    const styles = useStyles()
    return (
        <TableRow className={classNames({ [styles.failed]: transaction.failed })}>
            <TableCell>
                <Typography color="textSecondary" variant="body2">
                    {transaction.timeAt.toLocaleString()}
                </Typography>
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
                <Typography
                    className={classNames({ [styles.hidden]: isNil(transaction.gasFee) })}
                    color="textSecondary" variant="body2">
                    Gas fee
                </Typography>
                <Typography className={classNames({ [styles.hidden]: isNil(transaction.gasFee) })}>
                    {transaction.gasFee?.eth.toFixed(4)} ETH
                </Typography>
                <Typography
                    className={classNames({ [styles.hidden]: isNil(transaction.gasFee) })}
                    color="textSecondary">
                    {transaction.gasFee?.usd.toFixed(2)} USD
                </Typography>
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
