import type { CSSProperties, FC } from 'react'
import classNames from 'classnames'
import { isNil } from 'lodash-es'
import { createStyles, Link, makeStyles, TableCell, TableRow, Typography } from '@material-ui/core'
import { Record } from './Record'
import type { Transaction } from '../../../../plugins/Wallet/types'

interface Props {
    transaction: Transaction
    style?: CSSProperties
}

const useStyles = makeStyles(() =>
    createStyles({
        failed: { opacity: 0.3 },
        hidden: { visibility: 'hidden' },
        overflow: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        row: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
        },
    }),
)

export const Row: FC<Props> = ({ transaction, ...rest }) => {
    const styles = useStyles()
    return (
        <TableRow component="div" className={classNames(styles.row, { [styles.failed]: transaction.failed })} {...rest}>
            <TableCell component="div">
                <Typography color="textSecondary" variant="body2">
                    {transaction.timeAt.toLocaleString()}
                </Typography>
                <Address id={transaction.id} />
            </TableCell>
            <TableCell component="div">
                <Typography className={styles.overflow} color="textSecondary">
                    {transaction.type}
                </Typography>
                <Address id={transaction.toAddress} />
            </TableCell>
            <TableCell component="div">
                {transaction.pairs.map((pair, index) => (
                    <Record pair={pair} key={index} />
                ))}
            </TableCell>
            <TableCell align="right" component="div">
                <Typography
                    className={classNames({ [styles.hidden]: isNil(transaction.gasFee) })}
                    color="textSecondary">
                    Gas fee
                </Typography>
                <Typography className={classNames({ [styles.hidden]: isNil(transaction.gasFee) })} variant="body2">
                    {transaction.gasFee?.eth.toFixed(4)} ETH
                </Typography>
                <Typography
                    className={classNames({ [styles.hidden]: isNil(transaction.gasFee) })}
                    color="textSecondary"
                    variant="body2">
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
