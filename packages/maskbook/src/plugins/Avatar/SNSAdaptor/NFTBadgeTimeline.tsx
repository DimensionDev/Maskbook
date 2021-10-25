import { useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MaskMessages } from '../../../utils'
import { useNFTAvatar } from '../hooks'
import type { AvatarMetaDB } from '../types'
import { NFTBadge } from './NFTBadge'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 22,
        zIndex: 1,
        transform: 'scale(0.65)',
    },
}))
interface NFTBadgeTimelineProps {
    userId: string
    avatarId: string
}

export function NFTBadgeTimeline(props: NFTBadgeTimelineProps) {
    const { userId, avatarId } = props
    const { classes } = useStyles()
    const { loading, value: _avatar } = useNFTAvatar(userId)
    const [avatar, setAvatar] = useState<AvatarMetaDB>()
    const [avatarId_, setAvatarId_] = useState('')

    const onUpdate = (data: AvatarMetaDB) => {
        if (!data.address || !data.tokenId) {
            setAvatar(undefined)
            return
        }
        setAvatar(data)
        setAvatarId_(data.avatarId)
    }

    useEffect(() => {
        setAvatarId_(avatarId)
    }, [avatarId])

    useEffect(() => {
        setAvatar(_avatar)
    }, [_avatar])

    useEffect(() => MaskMessages.events.NFTAvatarTimelineUpdated.on((data) => onUpdate(data as AvatarMetaDB)), [])

    if (!avatar) return null
    if (avatarId_ && avatar.avatarId !== avatarId_) return null

    return (
        <div className={classes.root}>
            <NFTBadge avatar={avatar} />
        </div>
    )
}
