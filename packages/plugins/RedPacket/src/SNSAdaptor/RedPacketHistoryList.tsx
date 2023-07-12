import { Typography, List, Box } from '@mui/material'
import { makeStyles, LoadingBase } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { RedPacketInHistoryList } from './RedPacketInHistoryList.js'
import { useRedPacketHistory } from './hooks/useRedPacketHistory.js'
import { useI18N } from '../locales/index.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'
import { type NetworkPluginID } from '@masknet/shared-base'

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
            display: 'flex',
            flexDirection: 'column',
            height: 474,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: 360,
            margin: '0 auto',
        },
        emptyIcon: {
            width: 36,
            height: 36,
            marginBottom: 13,
        },
        loading: {
            fontSize: 14,
            marginTop: 13,
        },
    }
})

interface RedPacketHistoryListProps {
    onSelect: (payload: RedPacketJSONPayload) => void
}

export function RedPacketHistoryList(props: RedPacketHistoryListProps) {
    const { onSelect } = props
    const t = useI18N()
    const sharedI18N = useSharedI18N()
    const { classes } = useStyles()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: histories, loading } = useRedPacketHistory(account, chainId)

    if (loading) {
        return (
            <Box
                style={{
                    height: 474,
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                <LoadingBase size={30} />
                <Typography className={classes.loading}>{sharedI18N.loading()}</Typography>
            </Box>
        )
    }

    if (!histories?.length) {
        return (
            <Typography className={classes.placeholder} color="textSecondary">
                <Icons.EmptySimple className={classes.emptyIcon} />
                {t.search_no_result()}
            </Typography>
        )
    }

    return (
        <div className={classes.root}>
            <List style={{ padding: '16px 0 0' }}>
                {histories.map((history, i) => (
                    <RedPacketInHistoryList key={i} history={history} onSelect={onSelect} />
                ))}
            </List>
        </div>
    )
}
