import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { FC } from 'react'
import { TokenIcon } from '@masknet/shared'
import classNames from 'classnames'
import type { Transaction } from '../../../../plugins/Wallet/types'
import { DebankTransactionDirection, ZerionTransactionDirection } from '../../../../plugins/Wallet/types'

const useStyles = makeStyles()((theme) => ({
    root: { display: 'flex', alignItems: 'center' },
    icon: { width: 16, height: 16 },
    direction: { marginLeft: theme.spacing(0.5), marginRight: theme.spacing(0.5) },
    amount: { marginRight: theme.spacing(0.5) },
    symbol: { marginRight: theme.spacing(0.5) },
    receive: { color: '#00c087' },
}))

export const Record: FC<{ pair: Transaction['pairs'][number] }> = ({ pair }) => {
    const { classes: styles } = useStyles()
    return (
        <Typography
            component="section"
            variant="body2"
            className={classNames(styles.root, { [styles.receive]: pair.direction === 'receive' })}
            title={pair.name}>
            <TokenIcon classes={{ icon: styles.icon }} address={pair.address} logoURI={pair.logoURI} />
            <span className={styles.direction}>
                {pair.direction === DebankTransactionDirection.SEND || pair.direction === ZerionTransactionDirection.OUT
                    ? '-'
                    : '+'}
            </span>
            <span className={styles.amount}>{pair.amount.toFixed(4)}</span>
            <span className={styles.symbol}>{pair.symbol}</span>
        </Typography>
    )
}
