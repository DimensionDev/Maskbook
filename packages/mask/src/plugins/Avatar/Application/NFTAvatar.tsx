import { SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import { Avatar, Stack } from '@mui/material'
import { PointIcon } from '../assets/point'
import { RainbowBox } from '../SNSAdaptor/RainbowBox'

interface NFTAvatarProps {
    hasBorder: boolean
    platform?: string
    avatar?: string
    owner?: boolean
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { avatar, hasBorder, platform = '', owner = false } = props

    return (
        <Stack position="relative">
            {hasBorder ? (
                <RainbowBox>
                    <Avatar src={avatar} />
                </RainbowBox>
            ) : (
                <Avatar src={avatar} />
            )}

            <Stack sx={{ position: 'absolute', right: -9, bottom: 0, borderRadius: '100%', backgroundColor: 'white' }}>
                {platform.endsWith('.com')
                    ? SOCIAL_MEDIA_ICON_MAPPING[platform]
                    : SOCIAL_MEDIA_ICON_MAPPING[`${platform}.com`]}
            </Stack>
            {owner ? <PointIcon sx={{ position: 'absolute', top: 0, right: -9 }} /> : null}
        </Stack>
    )
}
