import { ElementAnchor, EmptyStatus } from '@masknet/shared'
import { createIndicator, type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { List } from '@mui/material'
import { memo, useMemo } from 'react'
import { RedPacketTrans, useRedPacketTrans } from '../locales/index.js'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { FireflyRedPacket } from '../../../../web3-providers/src/Firefly/RedPacket.js'
import { FireflyRedPacketDetailsItem } from './FireflyRedPacketDetailsItem.js'

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
    const t = useRedPacketTrans()
    const { classes } = useStyles()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: historiesData, fetchNextPage } = useSuspenseInfiniteQuery({
        queryKey: ['fireflyRedPacketHistory', account, historyType],
        initialPageParam: createIndicator(undefined, ''),
        queryFn: async ({ pageParam }) => {
            const res = await FireflyRedPacket.getHistory(
                historyType,
                account as `0x${string}`,
                FireflyRedPacketAPI.SourceType.FireflyPC,
                pageParam,
            )
            return res
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    })
    const histories = useMemo(() => historiesData.pages.flatMap((page) => page.data), [historiesData])

    if (!histories?.length)
        return (
            <EmptyStatus className={classes.placeholder}>
                {historyType === FireflyRedPacketAPI.ActionType.Claim ?
                    t.no_claim_history_data()
                :   <RedPacketTrans.no_sent_history_data
                        components={{
                            div: <div />,
                        }}
                    />
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
