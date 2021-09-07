import { useScrollBottomEvent } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { ERC721ContractDetailed, useAccount, useChainId } from '@masknet/web3-shared'
import { List, Typography } from '@material-ui/core'
import { useRef } from 'react'
import type { NftRedPacketHistory } from '../types'
import { useNftRedPacketHistory } from './hooks/useNftRedPacketHistory'
import { NftRedPacketHistoryItem } from './NftRedPacketHistoryItem'

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        margin: '0 auto',
        overflow: 'auto',
    },
    placeholder: {
        textAlign: 'center',
    },
})

interface Props {
    onSend: (history: NftRedPacketHistory, contract: ERC721ContractDetailed) => void
}

export function NftRedPacketHistoryList({ onSend }: Props) {
    const { classes } = useStyles()
    const account = useAccount()
    const chainId = useChainId()
    const { histories, fetchMore, loading } = useNftRedPacketHistory(account, chainId)
    const containerRef = useRef(null)

    useScrollBottomEvent(containerRef, fetchMore)

    if (loading) {
        return (
            <Typography className={classes.placeholder} color="textSecondary">
                Loading...
            </Typography>
        )
    }
    if (!histories?.length) {
        return null
    }

    return (
        <div ref={containerRef} className={classes.root}>
            <List>
                {histories.map((history) => (
                    <NftRedPacketHistoryItem key={history.rpid} history={history} onSend={onSend} />
                ))}
            </List>
        </div>
    )
}
