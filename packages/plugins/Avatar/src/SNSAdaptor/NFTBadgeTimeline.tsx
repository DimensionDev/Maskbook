import { useEffect, useState } from 'react'
import { AvatarType } from '../types.js'
import type { AvatarMetaDB } from '../types.js'
import { RainbowBox } from './RainbowBox.js'
import type { RSS3_KEY_SNS } from '../constants.js'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import type { NFTAvatarEvent } from '@masknet/shared-base'
import { useCheckPersonaNFTAvatar } from '../index.js'

interface NFTBadgeTimelineProps extends withClasses<'root'> {
    userId: string
    avatarId: string
    width: number
    height: number
    snsKey: RSS3_KEY_SNS
    timelineUpdated: UnboundedRegistry<NFTAvatarEvent>
    avatarType?: AvatarType
}

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(0.97)',
    },
}))

export function NFTBadgeTimeline(props: NFTBadgeTimelineProps) {
    const { userId, avatarId, width, height, snsKey, timelineUpdated } = props
    const { loading, value: _avatar } = useCheckPersonaNFTAvatar(userId, avatarId, '', snsKey)

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

    useEffect(() => timelineUpdated.on((data) => onUpdate(data as AvatarMetaDB)), [])

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
