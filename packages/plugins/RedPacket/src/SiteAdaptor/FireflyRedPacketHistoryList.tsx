import { ElementAnchor, EmptyStatus } from '@masknet/shared'
import { type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { List } from '@mui/material'
import { memo, useMemo } from 'react'
import { FireflyRedPacketDetailsItem } from './FireflyRedPacketDetailsItem.js'
import { useRedPacketHistory } from './hooks/useRedPacketHistory.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        root: {
            display: 'flex',
            padding: 0,
            boxSizing: 'border-box',
            flexDirection: 'column',
            margin: '0 auto',
            overflow: 'auto',
            height: 474,
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
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            '& div': {
                textAlign: 'center',
            },
        },
    }
})

interface RedPacketHistoryListProps {
    handleOpenDetails: (rpid: string) => void
    historyType: FireflyRedPacketAPI.ActionType
}

export const FireflyRedPacketHistoryList = memo(function RedPacketHistoryList({
    handleOpenDetails,
    historyType,
}: RedPacketHistoryListProps) {
    const { classes } = useStyles()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: historiesData, fetchNextPage } = useRedPacketHistory(account, historyType)
    const histories = useMemo(() => historiesData.pages.flatMap((page) => page.data), [historiesData])

    if (!histories?.length)
        return (
            <EmptyStatus className={classes.placeholder}>
                {historyType === FireflyRedPacketAPI.ActionType.Claim ?
                    <Trans>No Lucky Drops claimed</Trans>
                :   <div>
                        <Trans>No Lucky Drops created.</Trans>{' '}
                        <Trans>Select 🎁 when you compose a post to start your first drop.</Trans>
                    </div>
                }
            </EmptyStatus>
        )

    return (
        <div className={classes.root}>
            <List style={{ padding: '16px 0 0' }}>
                {histories.map((history) => (
                    <FireflyRedPacketDetailsItem
                        history={history}
                        key={history.redpacket_id}
                        handleOpenDetails={handleOpenDetails}
                    />
                ))}
            </List>
            <ElementAnchor callback={() => fetchNextPage()} />
        </div>
    )
})
