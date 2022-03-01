import { CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { MaskMessages } from '../../../utils'
import { useNFTAvatar } from '../hooks'
import type { AvatarMetaDB } from '../types'
import { RainbowBox } from './RainbowBox'
import type { RSS3_KEY_SNS } from '../constants'
import { makeStyles, useStylesExtends } from '@masknet/theme'

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
    const { loading, value: _avatar } = useNFTAvatar(userId, snsKey)
    const [avatar, setAvatar] = useState<AvatarMetaDB>()
    const [avatarId_, setAvatarId_] = useState('')
    const classes = useStylesExtends(useStyles(), props)

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

    return loading ? (
        <CircularProgress size={width} />
    ) : (
        <RainbowBox width={width} height={height} radius="100%" classes={{ root: classes.root }} />
    )
}
