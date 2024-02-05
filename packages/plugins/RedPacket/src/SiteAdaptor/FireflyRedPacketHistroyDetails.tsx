import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { FireflyRedPacketDetailsItem } from './FireflyRedPacketDetailsItem.js'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { FireflyRedPacket } from '../../../../web3-providers/src/Firefly/RedPacket.js'
import { LoadingStatus, ElementAnchor } from '@masknet/shared'
import { type FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { createIndicator } from '@masknet/shared-base'
import { first } from 'lodash-es'
import { formatBalance } from '@masknet/web3-shared-base'
import { FireflyRedPacketAccountItem } from './FireflyRedPacketAccountItem.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: '12px 16px',
        height: 474,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
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
        padding: '0 12px',
    },
}))

interface Props {
    rpid: string
}

export const FireflyRedPacketHistoryDetails = memo(function FireflyRedPacketHistoryDetails({ rpid }: Props) {
    const { classes } = useStyles()
    const {
        data: claimData,
        isLoading,
        fetchNextPage,
    } = useSuspenseInfiniteQuery<FireflyRedPacketAPI.RedPacketClaimListInfo>({
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

    if (isLoading) return <LoadingStatus className={classes.placeholder} iconSize={30} />

    return (
        <div className={classes.container}>
            {claimInfo ?
                <FireflyRedPacketDetailsItem history={{ ...claimInfo, redpacket_id: rpid }} />
            :   null}
            <Box>
                {claimList.map((item) => (
                    <div className={classes.claimer} key={item?.creator}>
                        <FireflyRedPacketAccountItem addressOrEns={item?.creator} />
                        <Typography>
                            {formatBalance(item?.token_amounts, item?.token_decimal, {
                                significant: 2,
                                isPrecise: true,
                            })}{' '}
                            {item?.token_symbol}
                        </Typography>
                    </div>
                ))}
                <ElementAnchor callback={() => fetchNextPage()} height={10} />
            </Box>
        </div>
    )
})
