import { CircularProgress, createStyles, makeStyles, Typography, Box } from '@material-ui/core'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useTransactionDialog } from '../../../web3/hooks/useTransactionDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useAllPoolsAsSeller } from '../hooks/useAllPoolsAsSeller'
import { useDestructCallback } from '../hooks/useDestructCallback'
import type { JSON_PayloadInMask } from '../types'
import { PoolInList } from './PoolInList'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            height: '100%',
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
    }),
)
export interface PoolListProps {
    onSend: (payload: JSON_PayloadInMask) => void
}

export function PoolList(props: PoolListProps) {
    const classes = useStyles()
    const account = useAccount()
    const { value: pools = [], loading, retry } = useAllPoolsAsSeller(account)

    //#region withdraw
    const [destructState, destructCallback, resetDestructCallback] = useDestructCallback(false)
    useTransactionDialog(null, destructState, TransactionStateType.CONFIRMED, () => {
        retry()
        resetDestructCallback()
    })
    //#endregion

    return (
        <div className={classes.root}>
            {loading ? (
                <Box className={classes.content}>
                    <CircularProgress />
                </Box>
            ) : pools.length === 0 ? (
                <Typography variant="body1" color="textSecondary" className={classes.content}>
                    No Data
                </Typography>
            ) : (
                <div className={classes.content}>
                    {pools.map((x) => (
                        <PoolInList
                            key={x.pool.pid}
                            {...x}
                            onSend={props.onSend}
                            onWithdraw={(payload: JSON_PayloadInMask) => {
                                destructCallback(payload.pid)
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
