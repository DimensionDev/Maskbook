import { useEffect, useState } from 'react'
import type { AvatarMetaDB } from '../types.js'
import { RainbowBox } from './RainbowBox.js'
import type { RSS3_KEY_SNS } from '../constants.js'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { usePersonaNFTAvatar } from '../hooks/usePersonaNFTAvatar.js'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'

interface NFTBadgeTimelineProps extends withClasses<'root'> {
    userId: string
    avatarId: string
    width: number
    height: number
    snsKey: RSS3_KEY_SNS
}

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(0.97)',
    },
}))

export function NFTBadgeTimeline(props: NFTBadgeTimelineProps) {
    const { userId, avatarId, width, height, snsKey } = props
    const { loading, value: _avatar } = usePersonaNFTAvatar(userId, avatarId, '', snsKey)
    const [avatar, setAvatar] = useState<AvatarMetaDB>()
    const [avatarId_, setAvatarId_] = useState('')
    const { classes } = useStyles(undefined, { props })
    const { NFTAvatarTimelineUpdated } = useSNSAdaptorContext()

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

    useEffect(() => NFTAvatarTimelineUpdated.on((data) => onUpdate(data as AvatarMetaDB)), [])

    if (!avatar) return null
    if (avatarId_ && avatar.avatarId !== avatarId_) return null

    return loading ? (
        <LoadingBase size={width} />
    ) : (
        <RainbowBox width={width} height={height} radius="100%" classes={{ root: classes.root }} />
    )
}
