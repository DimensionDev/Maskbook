import { makeStyles, Typography, List } from '@material-ui/core'
import type { RedPacketJSONPayload, RedPacket_InMask_Record } from '../types'
import { useAccount } from '@dimensiondev/web3-shared'
import { RedPacketInHistoryList } from './RedPacketInList'
import { useAllRedPackets } from '../hooks/useAllRedPackets'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        margin: '0 auto',
    },
    list: {
        width: '100%',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    placeholder: {
        textAlign: 'center',
    },
}))

interface RedPacketHistoryListProps {
    payloads: RedPacket_InMask_Record[]
    onSelect: (payload: RedPacketJSONPayload) => void
    onClose: () => void
}

function RedPacketHistoryList(props: RedPacketHistoryListProps) {
    const { payloads, onSelect, onClose } = props
    const classes = useStyles()
    return (
        <div className={classes.root}>
            {payloads.length === 0 ? (
                <Typography className={classes.placeholder} color="textSecondary">
                    No Data
                </Typography>
            ) : (
                <List>
                    {payloads.map((data) => (
                        <div key={data.history.rpid}>
                            <RedPacketInHistoryList data={data} onSelect={onSelect} onClose={onClose} />
                        </div>
                    ))}
                </List>
            )}
        </div>
    )
}
//#endregion

//#region backlog list
export interface RedPacketBacklogListProps extends withClasses<never> {
    onSelect: (payload: RedPacketJSONPayload) => void
    onClose: () => void
}

export function RedPacketBacklogList(props: RedPacketBacklogListProps) {
    const { onSelect, onClose } = props
    const account = useAccount()
    const classes = useStyles()
    const { value: payloads, loading } = useAllRedPackets(account)
    if (loading) {
        return (
            <Typography className={classes.placeholder} color="textSecondary">
                Loading...
            </Typography>
        )
    }
    return <RedPacketHistoryList payloads={payloads!} onSelect={onSelect} onClose={onClose} />
}
//#endregion
