import { useEffect, useSyncExternalStore } from 'react'
import { makeStyles } from '@masknet/theme'
import { AvatarStore } from '@masknet/web3-providers'
import { RainbowBox } from './RainbowBox.js'

interface NFTBadgeTimelineProps extends withClasses<'root'> {
    userId: string
    avatarId: string
    width: number
    height: number
}

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(0.97)',
    },
}))

export function NFTBadgeTimeline(props: NFTBadgeTimelineProps) {
    const { userId, avatarId, width, height } = props
    const { classes } = useStyles(undefined, { props })
    const store = useSyncExternalStore(AvatarStore.subscribe, AvatarStore.getSnapshot)

    useEffect(() => {
        AvatarStore.dispatch(userId, avatarId)
    }, [userId, avatarId])

    if (!store.retrieveAvatar(userId, avatarId)) return null

    return <RainbowBox width={width} height={height} radius={'100%'} classes={{ root: classes.root }} />
}
