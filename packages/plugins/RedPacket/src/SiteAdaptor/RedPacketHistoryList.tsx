import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import { type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { List } from '@mui/material'
import { memo } from 'react'
import { useRedPacketTrans } from '../locales/index.js'
import { RedPacketInHistoryList } from './RedPacketInHistoryList.js'
import { useRedPacketHistory } from './hooks/useRedPacketHistory.js'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        root: {
            display: 'flex',
            padding: 0,
            height: 474,
            boxSizing: 'border-box',
            flexDirection: 'column',
            margin: '0 auto',
            overflow: 'auto',
            [smallQuery]: {
                padding: 0,
            },
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        placeholder: {
            height: 474,
            boxSizing: 'border-box',
        },
    }
})

interface RedPacketHistoryListProps {
    onSelect: (payload: RedPacketJSONPayload) => void
}

export const RedPacketHistoryList = memo(function RedPacketHistoryList({ onSelect }: RedPacketHistoryListProps) {
    const t = useRedPacketTrans()
    const { classes } = useStyles()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [histories, { isLoading }] = useRedPacketHistory(account, chainId)

    if (isLoading) return <LoadingStatus className={classes.placeholder} iconSize={30} />

    if (!histories?.length) return <EmptyStatus className={classes.placeholder}>{t.search_no_result()}</EmptyStatus>

    return (
        <div className={classes.root}>
            <List style={{ padding: '16px 0 0' }}>
                {histories.map((history) => (
                    <RedPacketInHistoryList key={history.rpid} history={history} onSelect={onSelect} />
                ))}
            </List>
        </div>
    )
})
