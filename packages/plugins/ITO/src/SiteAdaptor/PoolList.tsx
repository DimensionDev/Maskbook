import { useRef } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles, LoadingBase } from '@masknet/theme'
import { useAllPoolsAsSeller } from './hooks/useAllPoolsAsSeller.js'
import type { JSON_PayloadInMask } from '../types.js'
import { PoolInList } from './PoolInList.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../locales/index.js'

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
    placeholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 564,
    },
}))
export interface PoolListProps {
    onSend: (payload: JSON_PayloadInMask) => void
}

export function PoolList(props: PoolListProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value = { loadMore: true, pools: [] }, loading, retry } = useAllPoolsAsSeller(account)
    const { pools } = value
    const containerRef = useRef<HTMLDivElement>(null)

    if (loading) {
        return (
            <Box className={classes.placeholder}>
                <LoadingBase />
            </Box>
        )
    }
    if (!pools.length) {
        return (
            <Box className={classes.placeholder}>
                <Typography variant="body1" color="textSecondary" className={classes.placeholder}>
                    {t.no_data()}
                </Typography>
            </Box>
        )
    }
    return (
        <div className={classes.root} ref={containerRef}>
            <div className={classes.content}>
                {pools.map((x) => (
                    <PoolInList key={x.pool.pid} {...x} onSend={props.onSend} onRetry={retry} />
                ))}
            </div>
        </div>
    )
}
