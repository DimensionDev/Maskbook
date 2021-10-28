import { useEffect, useState } from 'react'
import { MaskMessages } from '../../../utils'
import { useNFTAvatar } from '../hooks'
import type { AvatarMetaDB } from '../types'
import { RainbowBox } from './RainbowBox'

interface NFTBadgeTimelineProps extends withClasses<'root'> {
    userId: string
    avatarId: string
}

export function NFTBadgeTimeline(props: NFTBadgeTimelineProps) {
    const { userId, avatarId } = props
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

    useEffect(() => MaskMessages.events.NFTAvatarTimelineUpdated.on((data) => onUpdate(data as AvatarMetaDB)), [])

    if (!avatar) return null
    if (avatarId_ && avatar.avatarId !== avatarId_) return null

    return <RainbowBox width={47} height={47} radius="100%" />
}
