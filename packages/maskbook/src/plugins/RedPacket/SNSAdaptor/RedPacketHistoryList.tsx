import { Typography, List } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { RedPacketJSONPayload } from '../types'
import { useAccount, useChainId } from '@masknet/web3-shared'
import { RedPacketInHistoryList } from './RedPacketInHistoryList'
import { useRedPacketHistory } from './hooks/useRedPacketHistory'
import { useEffect } from 'react'

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        width: 544,
        height: '100%',
        flexDirection: 'column',
        margin: '0 auto',
    },
    placeholder: {
        textAlign: 'center',
    },
})

interface RedPacketHistoryListProps {
    onSelect: (payload: RedPacketJSONPayload) => void
}

export function RedPacketHistoryList(props: RedPacketHistoryListProps) {
    const { onSelect } = props
    const { classes } = useStyles()
    const account = useAccount()
    const chainId = useChainId()
    const { value: histories, loading, retry } = useRedPacketHistory(account, chainId)

    useEffect(() => {
        retry()
    }, [chainId])

    if (loading) {
        return (
            <Typography className={classes.placeholder} color="textSecondary">
                Loading...
            </Typography>
        )
    }

    return (
        <div className={classes.root}>
            {!histories || histories.length === 0 ? (
                <Typography className={classes.placeholder} color="textSecondary">
                    No Data
                </Typography>
            ) : (
                <List>
                    {histories.map((history) => (
                        <div key={history.rpid}>
                            <RedPacketInHistoryList history={history} onSelect={onSelect} />
                        </div>
                    ))}
                </List>
            )}
        </div>
    )
}
