import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { FireflyRedPacketDetailsItem } from './FireflyRedPacketDetailsItem.js'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { FireflyRedPacket } from '../../../../web3-providers/src/Firefly/RedPacket.js'
import { ElementAnchor } from '@masknet/shared'
import { createIndicator } from '@masknet/shared-base'
import { first } from 'lodash-es'
import { formatBalance } from '@masknet/web3-shared-base'
import { FireflyRedPacketAccountItem } from './FireflyRedPacketAccountItem.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: '12px 16px',
        height: 474,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    claimer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        padding: '0 12px',
    },
    claimerList: {
        height: 324,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    noData: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '318px',
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '24px',
        color: theme.palette.maskColor.secondaryDark,
    },
}))

interface Props {
    rpid: string
}

export const FireflyRedPacketHistoryDetails = memo(function FireflyRedPacketHistoryDetails({ rpid }: Props) {
    const { classes } = useStyles()
    const { data: claimData, fetchNextPage } = useSuspenseInfiniteQuery({
        queryKey: ['fireflyClaimHistory', rpid],
        initialPageParam: '',
        queryFn: async ({ pageParam }) => {
            const res = await FireflyRedPacket.getClaimHistory(rpid, createIndicator(undefined, pageParam as string))
            return res
        },
        getNextPageParam: (lastPage) => lastPage?.cursor,
    })

    const { claimInfo, claimList } = useMemo(
        () => ({ claimList: claimData?.pages.flatMap((x) => x?.list) ?? [], claimInfo: first(claimData?.pages) }),
        [claimData],
    )

    return (
        <div className={classes.container}>
            {claimInfo ?
                <FireflyRedPacketDetailsItem history={{ ...claimInfo, redpacket_id: rpid }} isDetail />
            :   null}
            <Box className={classes.claimerList}>
                {claimList.length ?
                    claimList.map((item) => (
                        <div className={classes.claimer} key={item.creator}>
                            <FireflyRedPacketAccountItem address={item.creator} chainId={claimInfo?.chain_id} />
                            <Typography>
                                {formatBalance(item.token_amounts, item.token_decimal, {
                                    significant: 6,
                                    isPrecise: true,
                                })}{' '}
                                {item.token_symbol}
                            </Typography>
                        </div>
                    ))
                :   <div className={classes.noData}>
                        <Trans>No claims yet for this Lucky Drop</Trans>
                    </div>
                }
                <ElementAnchor callback={() => fetchNextPage()} height={10} />
            </Box>
        </div>
    )
})
