import { createStyles, makeStyles, Typography } from '@material-ui/core'
import type { FC } from 'react'
import { TokenIcon } from '../TokenIcon'
import classNames from 'classnames'
import type { Transaction } from '../../../../plugins/Wallet/services'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: { display: 'flex', alignItems: 'center' },
        direction: { marginLeft: theme.spacing(0.5), marginRight: theme.spacing(0.5) },
        amount: { marginRight: theme.spacing(0.5) },
        symbol: { marginRight: theme.spacing(0.5) },
        receive: { color: '#00c087' },
    }),
)

export const Record: FC<{ pair: Transaction['pairs'][number] }> = ({ pair }) => {
    const styles = useStyles()
    return (
        <Typography
            component="section"
            variant="body2"
            className={classNames(styles.root, { [styles.receive]: pair.direction === 'receive' })}
            title={pair.name}>
            <TokenIcon address={pair.address} />
            <span className={styles.direction}>{pair.direction === 'send' ? '-' : '+'}</span>
            <span className={styles.amount}>{pair.amount.toFixed(4)}</span>
            <span className={styles.symbol}>{pair.symbol}</span>
        </Typography>
    )
}
