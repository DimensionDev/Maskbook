import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { CollectibleState } from '../../hooks/useCollectibleState'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
        gap: 12,
        justifyContent: 'center',
    },
    emptyIcon: {
        width: 36,
        height: 36,
    },
    emptyText: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
}))

export interface ActivityTabProps {}

export function ActivityTab(props: ActivityTabProps) {
    const { classes } = useStyles()
    const { events } = CollectibleState.useContainer()
    const _events = events.value ?? []
    console.log(_events, 'events')
    return useMemo(() => {
        if (events.loading) return <LoadingBase />
        if (!_events)
            return (
                <div className={classes.body}>
                    <Icons.EmptySimple className={classes.emptyIcon} />
                    <Typography className={classes.emptyText}>This NFT didn't have any activity</Typography>
                </div>
            )
        return (
            <CollectibleTab>
                <div className={classes.body} style={{ justifyContent: 'unset' }}>
                    <>
                        {/* {_events.map((x, idx) => (
                            <NFTActivityCard type={ActivityType.Mint} key={idx} activity={x} />
                        ))} */}
                    </>
                </div>
            </CollectibleTab>
        )
    }, [events, classes])
}
