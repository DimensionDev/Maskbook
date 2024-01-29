import { makeStyles } from '@masknet/theme'
import { TabPanel } from '@mui/lab'
import { Box, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { useRedPacketTrans } from '../locales/index.js'
import { FireflyRedPacketDetailsItem } from './FireflyRedPacketDetailsItem.js'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { FireflyRedPacket } from '../../../../web3-providers/src/Firefly/RedPacket.js'
import { LoadingStatus } from '@masknet/shared'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { createIndicator } from '@masknet/shared-base'
import { first } from 'lodash-es'
import { formatBalance } from '@masknet/web3-shared-base'
import { ElementAnchor } from '@masknet/shared'
import { isAddress } from 'web3-utils'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(0, 2, 0, 2),
  },
  placeholder: {
    height: 474,
    boxSizing: 'border-box',
  },
  claimer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1.5),
    fontSize: 14,
    fontWeight: 700,
    lineHeight: '18px',
  },
}))

interface Props {
  rpid: string
}

export const FireflyRedPacketHistoryDetails = memo(function RedPacketPast({ rpid }: Props) {
  const { classes } = useStyles()
  const t = useRedPacketTrans()
  const { data: claimData, isLoading, fetchNextPage } = useSuspenseInfiniteQuery<FireflyRedPacketAPI.RedPacketCliamListInfo>({
    queryKey: ['fireflyClaimHistory', rpid], initialPageParam: '', queryFn: async ({ pageParam }) => {
      const res = await FireflyRedPacket.getClaimHistory(rpid, createIndicator(undefined, pageParam as string))
      return res
    },
    getNextPageParam: (lastPage) => lastPage.cursor
  })

  if (isLoading) return <LoadingStatus className={classes.placeholder} iconSize={30} />
  const claimList = useMemo(() => claimData?.pages.flatMap((x) => x.list) ?? [], [claimData])
  const claimInfo = useMemo(() => first(claimData.pages), [claimData])

  return (
    <div className={classes.container}>
      {claimInfo ?
        <FireflyRedPacketDetailsItem claimInfo={claimInfo} redpacket_id={rpid} />
        : null
      }
      <Box>
        {claimList.map((item) => <div className={classes.claimer}>
          <Box>
            <Typography>
              {isAddress(item.creator) ? formatEthereumAddress(item.creator, 4) : item.creator}
            </Typography>
          </Box>
          <Typography>
            {formatBalance(
              item.token_amounts,
              item.token_decimal,
              { significant: 2, isPrecise: true },
            )} {item.token_symbol}
          </Typography>
        </div>)
        }
        <ElementAnchor callback={() => fetchNextPage()} height={10} />
      </Box>
    </div >
  )
})
