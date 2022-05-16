import { useRef } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useAllPoolsAsSeller } from './hooks/useAllPoolsAsSeller'
import type { JSON_PayloadInMask } from '../types'
import { PoolInList } from './PoolInList'
import { useI18N } from '../../../utils'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
    const { t } = useI18N()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { value = { loadMore: true, pools: [] }, loading, retry } = useAllPoolsAsSeller(account)
    const { pools } = value
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <div className={classes.root} ref={containerRef}>
            {loading ? (
                <Box className={classes.content}>
                    <CircularProgress />
                </Box>
            ) : pools.length === 0 ? (
                <Typography variant="body1" color="textSecondary" className={classes.content}>
                    {t('no_data')}
                </Typography>
            ) : (
                <div className={classes.content}>
                    {pools.map((x) => (
                        <PoolInList key={x.pool.pid} {...x} onSend={props.onSend} onRetry={retry} />
                    ))}
                    {loading ? <CircularProgress /> : null}
                </div>
            )}
        </div>
    )
}
