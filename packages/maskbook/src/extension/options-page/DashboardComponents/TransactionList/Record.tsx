import { createStyles, makeStyles, Typography } from '@material-ui/core'
import type { FC } from 'react'
import type { Transaction } from '../../../../plugins/Wallet/apis'
import { TokenIcon } from '../TokenIcon'
import classNames from 'classnames'

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
        },
        direction: {
            marginLeft: '4px',
            marginRight: '4px',
        },
        amount: {
            marginRight: '4px',
        },
        symbol: {
            marginRight: '4px',
        },
        receive: {
            color: '#00c087',
        },
    }),
)

export const Record: FC<{ pair: Transaction['pairs'][number] }> = ({ pair }) => {
    const styles = useStyles()
    return (
        <Typography
            component="section"
            className={classNames(styles.root, { [styles.receive]: pair.direction === 'receive' })}
            title={pair.name}>
            <TokenIcon address={pair.address} />
            <span className={styles.direction}>{pair.direction === 'send' ? '-' : '+'}</span>
            <span className={styles.amount}>{pair.amount.toFixed(4)}</span>
            <span className={styles.symbol}>{pair.symbol}</span>
        </Typography>
    )
}
