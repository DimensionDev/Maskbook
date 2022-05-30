import { Typography, List } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { RedPacketJSONPayload } from '../types'
import { RedPacketInHistoryList } from './RedPacketInHistoryList'
import { useRedPacketHistory } from './hooks/useRedPacketHistory'
import { useI18N } from '../../../utils'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { value: histories, loading } = useRedPacketHistory(account, chainId)

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
