import type { FC } from 'react'
import classNames from 'classnames'
import { isNil } from 'lodash-es'
import { Link, makeStyles, TableCell, TableRow, Typography } from '@material-ui/core'
import { Record } from './Record'
import type { Transaction } from '../../../../plugins/Wallet/types'
import { resolveLinkOnEtherscan } from '../../../../web3/pipes'
import type { ChainId } from '../../../../web3/types'

interface Props {
    chainId: ChainId
    transaction: Transaction
}

const useStyles = makeStyles(() => ({
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
}))

export const Row: FC<Props> = ({ transaction, chainId }) => {
    const styles = useStyles()
    return (
        <TableRow component="div" className={classNames({ [styles.failed]: transaction.failed })}>
            <TableCell component="div">
                <Typography color="textSecondary" variant="body2">
                    {transaction.timeAt.toLocaleString()}
                </Typography>
                <Address chainId={chainId} mode="tx" id={transaction.id} />
            </TableCell>
            <TableCell component="div">
                <Typography className={styles.overflow} color="textSecondary">
                    {transaction.type}
                </Typography>
                <Address chainId={chainId} mode="address" id={transaction.toAddress} />
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

interface AddressProps {
    id: string | undefined
    mode: 'tx' | 'address'
    chainId: ChainId
}

const Address: FC<AddressProps> = ({ id, mode, chainId }) => {
    const href = `${resolveLinkOnEtherscan(chainId)}/${mode}/${id}`
    return id ? (
        <Link target={id} href={href}>
            <span>{id?.slice(0, 5)}</span>
            <span>...</span>
            <span>{id?.slice(id.length - 5)}</span>
        </Link>
    ) : null
}
