import { useAccount } from '@masknet/web3-shared'
import { Box, CircularProgress, makeStyles, Typography } from '@material-ui/core'
import { useAllPoolsAsSeller } from '../hooks/useAllPoolsAsSeller'
import type { JSON_PayloadInMask } from '../types'
import { PoolInList } from './PoolInList'

const useStyles = makeStyles((theme) => ({
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
}))
export interface PoolListProps {
    onSend: (payload: JSON_PayloadInMask) => void
}

export function PoolList(props: PoolListProps) {
    const classes = useStyles()
    const account = useAccount()
    const { value: pools = [], loading, retry } = useAllPoolsAsSeller(account)

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
                        <PoolInList key={x.pool.pid} {...x} onSend={props.onSend} onRetry={retry} />
                    ))}
                </div>
            )}
        </div>
    )
}
