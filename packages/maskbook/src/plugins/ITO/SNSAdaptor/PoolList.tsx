import { useAccount } from '@masknet/web3-shared-evm'
import { Box, CircularProgress, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useAllPoolsAsSeller } from './hooks/useAllPoolsAsSeller'
import { useScrollBottomEvent } from '@masknet/shared'
import type { JSON_PayloadInMask } from '../types'
import { PoolInList } from './PoolInList'
import { useRef, useState, useCallback } from 'react'

const useStyles = makeStyles()((theme) => ({
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
    const { classes } = useStyles()
    const account = useAccount()
    const [page, setPage] = useState(0)
    const { value = { loadMore: true, pools: [] }, loading, retry } = useAllPoolsAsSeller(account, page)
    const { pools, loadMore } = value
    const containerRef = useRef<HTMLDivElement>(null)
    const addPage = useCallback(() => (loadMore ? setPage(page + 1) : void 0), [page, loadMore])
    useScrollBottomEvent(containerRef, addPage)

    return (
        <div className={classes.root} ref={containerRef}>
            {loading && page === 0 ? (
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
                    {loading && page > 0 ? <CircularProgress /> : null}
                </div>
            )}
        </div>
    )
}
