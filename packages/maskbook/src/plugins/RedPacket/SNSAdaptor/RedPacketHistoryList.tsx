import { makeStyles, Typography, List } from '@material-ui/core'
import type { RedPacketJSONPayload } from '../types'
import { useAccount, useChainId } from '@masknet/web3-shared'
import { RedPacketInHistoryList } from './RedPacketInHistoryList'
import { useRedPacketHistory } from './hooks/useRedPacketHistory'
import { useEffect } from 'react'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        margin: '0 auto',
    },
    placeholder: {
        textAlign: 'center',
    },
}))

interface RedPacketHistoryListProps {
    onSelect: (payload: RedPacketJSONPayload) => void
    onClose: () => void
}

export function RedPacketHistoryList(props: RedPacketHistoryListProps) {
    const { onSelect, onClose } = props
    const classes = useStyles()
    const account = useAccount()
    const chainId = useChainId()
    const { value: historys, loading, retry } = useRedPacketHistory(account, chainId)

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
            {!historys || historys.length === 0 ? (
                <Typography className={classes.placeholder} color="textSecondary">
                    No Data
                </Typography>
            ) : (
                <List>
                    {historys.map((history) => (
                        <div key={history.rpid}>
                            <RedPacketInHistoryList history={history} onSelect={onSelect} onClose={onClose} />
                        </div>
                    ))}
                </List>
            )}
        </div>
    )
}
