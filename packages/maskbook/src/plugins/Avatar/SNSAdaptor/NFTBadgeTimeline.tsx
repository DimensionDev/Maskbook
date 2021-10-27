import { useStylesExtends } from '@masknet/shared'
import { keyframes, makeStyles } from '@masknet/theme'
import { useEffect, useState } from 'react'
import { MaskMessages } from '../../../utils'
import { useNFTAvatar } from '../hooks'
import type { AvatarMetaDB } from '../types'

const rainbowButton = keyframes`

0%,to {
    background-color: #00f8ff;
    -webkit-box-shadow: 0 5px 10px rgba(0,248,255,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(0,248,255,.4),0 10px 20px rgba(37,41,46,.2)
}

20% {
    background-color: #a4ff00;
    -webkit-box-shadow: 0 5px 10px rgba(164,255,0,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(164,255,0,.4),0 10px 20px rgba(37,41,46,.2)
}

40% {
    background-color: #f7275e;
    -webkit-box-shadow: 0 5px 10px rgba(247,39,94,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(247,39,94,.4),0 10px 20px rgba(37,41,46,.2)
}

60% {
    background-color: #ffd300;
    -webkit-box-shadow: 0 5px 10px rgba(255,211,0,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(255,211,0,.4),0 10px 20px rgba(37,41,46,.2)
}

80% {
    background-color: #ff8a00;
    -webkit-box-shadow: 0 5px 10px rgba(255,138,0,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(255,138,0,.4),0 10px 20px rgba(37,41,46,.2)
}
`
const useStyles = makeStyles()(() => ({
    root: {
        position: 'absolute',
        left: -2,
        right: 0,
        top: -2,
        zIndex: -1,
    },
    nft: {
        animationDelay: '0.2',
        animation: `${rainbowButton} 6s linear infinite`,
        webkitAnimation: `${rainbowButton} 6s linear infinite`,
        width: 47,
        height: 47,
        boxShadow: '0 5px 10px rgb(0 248 255 / 40%), 0 10px 20px rgb(37 41 46 / 20%)',
        transition: '.125s ease',
        borderRadius: 99999,
    },
}))
interface NFTBadgeTimelineProps extends withClasses<'root'> {
    userId: string
    avatarId: string
}

export function NFTBadgeTimeline(props: NFTBadgeTimelineProps) {
    const { userId, avatarId } = props
    const classes = useStylesExtends(useStyles(), props)
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

    return (
        <div className={classes.root}>
            <div className={classes.nft} />
        </div>
    )
}
