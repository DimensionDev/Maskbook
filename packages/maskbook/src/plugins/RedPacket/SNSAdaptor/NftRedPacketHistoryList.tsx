import { makeStyles } from '@masknet/theme'
import { ERC721ContractDetailed, useAccount, useChainId } from '@masknet/web3-shared'
import { List, Typography } from '@material-ui/core'
import { useEffect } from 'react'
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
    const { value: histories, loading, retry } = useNftRedPacketHistory(account, chainId)

    useEffect(() => {
        retry()
    }, [chainId, account])

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
        <List className={classes.root}>
            {histories.map((history) => (
                <NftRedPacketHistoryItem key={history.rpid} history={history} onSend={onSend} />
            ))}
        </List>
    )
}
