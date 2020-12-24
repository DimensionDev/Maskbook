import { CircularProgress, createStyles, makeStyles, Typography, Box } from '@material-ui/core'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useTransactionDialog } from '../../../web3/hooks/useTransactionDialog'
import { useAllPoolsAsSeller } from '../hooks/useAllPoolsAsSeller'
import { useDestructCallback } from '../hooks/useDestructCallback'
import type { JSON_PayloadInMask } from '../types'
import { PoolsInList } from './PoolInList'

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
        list: {
            width: '100%',
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }),
)
export interface PoolListProps {
    onSend: (payload: JSON_PayloadInMask) => void
    FixedSizeListProps?: Partial<FixedSizeListProps>
}

export function PoolList(props: PoolListProps) {
    const classes = useStyles()
    const account = useAccount()
    const { value: pools = [], loading, retry } = useAllPoolsAsSeller(account)
    const { FixedSizeListProps } = props

    //#region withdraw
    const [destructState, destructCallback, resetDestructCallback] = useDestructCallback()
    useTransactionDialog({}, destructState, () => {
        retry()
        resetDestructCallback()
    })
    //#endregion

    console.log('DEBUG: pool list')
    console.log(pools)
    return (
        <>
            {loading ? (
                <Box className={classes.root}>
                    <CircularProgress />
                </Box>
            ) : pools.length === 0 ? (
                <Typography variant="body1" color="textSecondary" className={classes.root}>
                    No Data
                </Typography>
            ) : (
                <FixedSizeList
                    className={classes.list}
                    width="100%"
                    height={500}
                    overscanCount={4}
                    itemSize={60}
                    itemData={{
                        pools: pools,
                        onSend: props.onSend,
                        onWithdraw(payload: JSON_PayloadInMask) {
                            destructCallback(payload.pid)
                        },
                    }}
                    itemCount={pools.length}
                    {...FixedSizeListProps}>
                    {PoolsInList}
                </FixedSizeList>
            )}
        </>
    )
}
