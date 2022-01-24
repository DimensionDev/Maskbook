import { Typography, List } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { RedPacketJSONPayload } from '../types'
import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { RedPacketInHistoryList } from './RedPacketInHistoryList'
import { useRedPacketHistory } from './hooks/useRedPacketHistory'
import { useEffect } from 'react'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        root: {
            display: 'flex',
            padding: '0 12px',
            boxSizing: 'border-box',
            height: '100%',
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
            textAlign: 'center',
        },
    }
})

interface RedPacketHistoryListProps {
    onSelect: (payload: RedPacketJSONPayload) => void
}

export function RedPacketHistoryList(props: RedPacketHistoryListProps) {
    const { onSelect } = props
    const { t } = useI18N()
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
                {t('loading')}
            </Typography>
        )
    }

    return (
        <div className={classes.root}>
            {!histories || histories.length === 0 ? (
                <Typography className={classes.placeholder} color="textSecondary">
                    {t('no_data')}
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
