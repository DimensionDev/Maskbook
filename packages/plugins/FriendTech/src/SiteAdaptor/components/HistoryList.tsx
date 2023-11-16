import { ElementAnchor, EmptyStatus, FormattedBalance, Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { FriendTech } from '@masknet/web3-providers'
import { formatBalance, formatElapsed, isSameAddress } from '@masknet/web3-shared-base'
import { Box, List, ListItem, Skeleton, Typography, type ListProps } from '@mui/material'
import { useInfiniteQuery } from '@tanstack/react-query'
import { range } from 'lodash-es'
import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { RoutePaths } from '../../constants.js'
import { Translate } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    list: {
        paddingTop: 0,
        overscrollBehavior: 'contain',
    },
    activity: {
        fontSize: 14,
        padding: 0,
        marginBottom: theme.spacing(1.5),
    },
    link: {
        cursor: 'pointer',
    },
    avatarStack: {
        display: 'flex',
    },
    avatar: {
        borderRadius: '50%',
        width: 40,
        height: 40,
    },
}))

interface Props extends ListProps {
    account: string
}

function HistoryItemSkeleton() {
    const { classes, theme } = useStyles()
    return (
        <ListItem className={classes.activity}>
            <Box className={classes.avatarStack}>
                <Skeleton className={classes.avatar} variant="circular" width={40} height={40} />
                <Skeleton
                    className={classes.avatar}
                    variant="circular"
                    width={40}
                    height={40}
                    style={{ marginLeft: -11 }}
                />
            </Box>
            <Box flexGrow={1} ml={2}>
                <Skeleton variant="text" width={250} />
                <Box display="flex" color={theme.palette.maskColor.second}>
                    <Skeleton variant="text" width={70} />
                    <Skeleton variant="text" width={40} style={{ marginLeft: 5 }} />
                </Box>
            </Box>
        </ListItem>
    )
}

export const HistoryList = memo(function HistoryList({ account, className, ...rest }: Props) {
    const navigate = useNavigate()
    const { classes, theme, cx } = useStyles()
    const { data, isFetching, isInitialLoading, fetchNextPage, dataUpdatedAt } = useInfiniteQuery({
        enabled: !!account,
        queryKey: ['friend-tech', 'activities', account],
        queryFn: ({ pageParam: nextIndicator }) => FriendTech.getActivities(account, nextIndicator),
        getNextPageParam: (x) => x.nextIndicator,
    })
    const activities = useMemo(() => data?.pages.flatMap((x) => x.data) || [], [data?.pages])

    if (!isInitialLoading && !activities.length) {
        return (
            <Box height="100%" display="flex" flexDirection="column" justifyContent="center">
                <EmptyStatus />
            </Box>
        )
    }

    return (
        <List className={cx(classes.list, className)} {...rest}>
            {activities.map((activity) => {
                const address = activity.isBuy ? activity.subject.address : activity.trader.address
                const otherLink =
                    isSameAddress(address, account) ? undefined : (
                        urlcat(RoutePaths.Detail, {
                            address,
                            title: activity.isBuy ? activity.subject.name : activity.trader.name,
                        })
                    )
                return (
                    <ListItem key={`${activity.blockNumber}-${activity.transactionIndex}`} className={classes.activity}>
                        <Box className={classes.avatarStack}>
                            <Image
                                className={classes.avatar}
                                classes={{ failed: classes.avatar }}
                                size={40}
                                src={activity.trader.pfpUrl}
                            />
                            <Image
                                className={classes.avatar}
                                containerProps={{ style: { marginLeft: -11 } }}
                                size={40}
                                classes={{ failed: classes.avatar }}
                                src={activity.subject.pfpUrl}
                            />
                        </Box>
                        <Box flexGrow={1} ml={2}>
                            <Typography fontWeight={700} color={theme.palette.maskColor.main}>
                                <Translate.key_trade
                                    values={{
                                        trader: activity.trader.name,
                                        subject: activity.subject.name,
                                        count: Number.parseInt(activity.shareAmount, 10),
                                    }}
                                    context={activity.isBuy ? 'buy' : 'sell'}
                                    components={{
                                        other: (
                                            <span
                                                className={classes.link}
                                                role="link"
                                                onClick={() => {
                                                    if (!otherLink) return
                                                    navigate(otherLink)
                                                }}
                                            />
                                        ),
                                    }}
                                />
                            </Typography>

                            <Box display="flex" color={theme.palette.maskColor.second}>
                                <Typography
                                    color={
                                        activity.isBuy ?
                                            theme.palette.maskColor.success
                                        :   theme.palette.maskColor.danger
                                    }
                                    fontWeight={700}>
                                    <FormattedBalance
                                        value={activity.ethAmount}
                                        decimals={18}
                                        formatter={formatBalance}
                                    />{' '}
                                    ETH
                                </Typography>
                                <Typography>, {formatElapsed(activity.createdAt)}</Typography>
                            </Box>
                        </Box>
                    </ListItem>
                )
            })}
            {isFetching ? range(6).map((i) => <HistoryItemSkeleton key={i} />) : null}
            <ElementAnchor callback={() => fetchNextPage()} key={dataUpdatedAt} height={1} />
        </List>
    )
})
