import { useEffect, useState } from 'react'
import { AvatarType } from '../types.js'
import type { AvatarMetaDB } from '../types.js'
import { RainbowBox } from './RainbowBox.js'
import type { RSS3_KEY_SITE } from '../constants.js'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useCheckPersonaNFTAvatar } from '../index.js'
import { MaskMessages } from '@masknet/shared-base'

interface NFTBadgeTimelineProps extends withClasses<'root'> {
    userId: string
    avatarId: string
    width: number
    height: number
    siteKey: RSS3_KEY_SITE
    avatarType?: AvatarType
}

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(0.97)',
    },
}))

export function NFTBadgeTimeline(props: NFTBadgeTimelineProps) {
    const { userId, avatarId, width, height, siteKey } = props
    const { loading, value: _avatar } = useCheckPersonaNFTAvatar(userId, avatarId, '', siteKey)

    const [avatar, setAvatar] = useState<AvatarMetaDB>()
    const [avatarId_, setAvatarId_] = useState(avatarId)
    const { classes } = useStyles(undefined, { props })

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

    if (!avatar || !avatarId || avatar.avatarId !== avatarId_) return null

    return loading ? (
        <LoadingBase size={width} />
    ) : (
        <RainbowBox
            width={width}
            height={height}
            radius={props.avatarType === AvatarType.Square ? '5px' : '100%'}
            classes={{ root: classes.root }}
        />
    )
}
