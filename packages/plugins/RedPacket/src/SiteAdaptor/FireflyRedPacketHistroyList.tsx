import { ElementAnchor, EmptyStatus, LoadingStatus } from '@masknet/shared'
import { createIndicator, type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { List } from '@mui/material'
import { memo, useMemo } from 'react'
import { useRedPacketTrans } from '../locales/index.js'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { FireflyRedPacket } from '../../../../web3-providers/src/Firefly/RedPacket.js'
import { FireflyRedPacketInSentHistoryList } from './FireflyRedPacketInSentHistoryList.js'
import { FireflyRedPacketInClaimedHistoryList } from './FireflyRedPacketInClaimedHistoryList.js'

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
    const {
        data: historiesData,
        isLoading,
        fetchNextPage,
    } = useSuspenseInfiniteQuery({
        queryKey: ['fireflyRedPacketHistory', account, historyType],
        initialPageParam: createIndicator(undefined, ''),
        queryFn: async ({ pageParam }) => {
            const res = await FireflyRedPacket.getHistory(
                historyType,
                '0x790116d0685eb197b886dacad9c247f785987a4a',
                pageParam,
            )
            console.log(res, pageParam)
            return res
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    })
    const histories = useMemo(() => historiesData.pages.flatMap((page) => page.data), [historiesData])

    if (isLoading) return <LoadingStatus className={classes.placeholder} iconSize={30} />

    if (!histories?.length) return <EmptyStatus className={classes.placeholder}>{t.search_no_result()}</EmptyStatus>

    return (
        <div className={classes.root}>
            <List style={{ padding: '16px 0 0' }}>
                {histories.map((history) =>
                    historyType === FireflyRedPacketAPI.ActionType.Send ?
                        <FireflyRedPacketInSentHistoryList
                            key={history.trans_hash}
                            history={history as FireflyRedPacketAPI.RedPacketSentInfo}
                            handleOpenDetails={handleOpenDetails}
                        />
                    :   <FireflyRedPacketInClaimedHistoryList
                            key={history.trans_hash}
                            history={history as FireflyRedPacketAPI.RedPacketClaimedInfo}
                            handleOpenDetails={handleOpenDetails}
                        />,
                )}
            </List>
            <ElementAnchor callback={() => fetchNextPage()} />
        </div>
    )
})
