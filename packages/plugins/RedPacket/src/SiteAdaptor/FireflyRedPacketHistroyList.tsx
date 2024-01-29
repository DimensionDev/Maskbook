import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import { type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { List } from '@mui/material'
import { memo } from 'react'
import { useRedPacketTrans } from '../locales/index.js'
import { useQuery } from '@tanstack/react-query'
import { FireflyRedPacket } from '../../../../web3-providers/src/Firefly/RedPacket.js'
import { FireflyRedPacketInSentHistoryList } from './FIreflyRedPacketInSentHistoryList.js'
import { FireflyRedPacketInClaimedHistoryList } from './FireflyRedPacketInClaimedHistoryList.js'

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
      height: 474,
      boxSizing: 'border-box',
    },
  }
})

interface RedPacketHistoryListProps {
  handleOpenDetails: (rpid: string) => void
  historyType: FireflyRedPacketAPI.ActionType
}

export const FireflyRedPacketHistoryList = memo(function RedPacketHistoryList({ handleOpenDetails, historyType }: RedPacketHistoryListProps) {
  const t = useRedPacketTrans()
  const { classes } = useStyles()
  const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
  const { data: histories, isLoading } = useQuery({
    queryKey: ['fireflyRedPacketHistory', account, historyType], queryFn: async () => {
      const res = await FireflyRedPacket.getHistory(historyType, account as `0x${string}`)
      return res
    }
  })

  if (isLoading) return <LoadingStatus className={classes.placeholder} iconSize={30} />

  if (!histories?.data?.length) return <EmptyStatus className={classes.placeholder}>{t.search_no_result()}</EmptyStatus>

  return (
    <div className={classes.root}>
      <List style={{ padding: '16px 0 0' }}>
        {histories?.data?.map((history) => (
          historyType === FireflyRedPacketAPI.ActionType.Send ? <FireflyRedPacketInSentHistoryList key={history.trans_hash} history={history as FireflyRedPacketAPI.RedPacketSentInfo} handleOpenDetails={handleOpenDetails} />
            : <FireflyRedPacketInClaimedHistoryList key={history.trans_hash} history={history as FireflyRedPacketAPI.RedPacketClaimedInfo} handleOpenDetails={handleOpenDetails} />
        ))}
      </List>
    </div>
  )
})
