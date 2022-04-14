import { SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import { Avatar, Stack } from '@mui/material'
import { RainbowBox } from '../SNSAdaptor/RainbowBox'

interface NFTAvatarProps {
    hasBorder: boolean
    platform?: string
    avatar?: string
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { avatar, hasBorder, platform = '' } = props
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
                {SOCIAL_MEDIA_ICON_MAPPING[`${platform}.com`]}
            </Stack>
        </Stack>
    )
}
