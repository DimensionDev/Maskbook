import { useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MaskMessage } from '../../../utils'
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
interface NFTBadgeTimeLineProps {
    userId: string
    avatarId: string
}

export function NFTBadgeTimeLine(props: NFTBadgeTimeLineProps) {
    const { userId, avatarId } = props
    const { classes } = useStyles()
    const _avatar = useNFTAvatar(userId)
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

    useEffect(() => MaskMessage.events.NFTAvatarTimeLineUpdated.on((data) => onUpdate(data as AvatarMetaDB)), [])

    if (!avatar) return null
    if (avatarId_ && avatar.avatarId !== avatarId_) return null

    return (
        <div className={classes.root}>
            <NFTBadge avatar={avatar} />
        </div>
    )
}
