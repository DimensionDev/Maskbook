import { CircularProgress, createStyles, makeStyles, Typography, Box } from '@material-ui/core'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useAllPoolsAsSeller } from '../hooks/useAllPoolsAsSeller'
import type { JSON_PayloadInMask } from '../types'
import { PoolInList } from './PoolInList'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
            justifyItems: 'center',
            alignItems: 'center',
        },
    }),
)
export interface PoolListProps {
    onSend: (payload: JSON_PayloadInMask) => void
}

export function PoolList(props: PoolListProps) {
    const classes = useStyles()
    const account = useAccount()
    const pools = useAllPoolsAsSeller('0x66b57885e8e9d84742fabda0ce6e3496055b012d')

    console.log('DEBUG: pool list')
    console.log(pools)
    return (
        <>
            {pools.loading ? (
                <Box className={classes.root}>
                    <CircularProgress />
                </Box>
            ) : pools.value?.length === 0 ? (
                <Typography variant="body1" color="textSecondary" className={classes.root}>
                    No Data
                </Typography>
            ) : (
                pools.value?.map((pool, index) => (
                    <PoolInList data={{ pool: pool, onSend: props.onSend }} index={index} />
                ))
            )}
        </>
    )
}
