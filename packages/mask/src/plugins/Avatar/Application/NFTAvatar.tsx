import { EnhanceableSite } from '@masknet/shared-base'
import { Avatar, Stack } from '@mui/material'
import { PointIcon } from '../assets/point'
import { TwitterIcon } from '../assets/twitter'
import { RainbowBox } from '../SNSAdaptor/RainbowBox'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<string, React.ReactNode> = {
    [EnhanceableSite.Twitter]: <TwitterIcon />,
    [EnhanceableSite.Localhost]: null,
}

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

            <Stack
                sx={{
                    position: 'absolute',
                    right: -9,
                    bottom: 0,
                    overflow: 'hidden',
                    borderRadius: '100%',
                    backgroundColor: 'white',
                }}>
                {SOCIAL_MEDIA_ICON_MAPPING['twitter.com']}
            </Stack>
            {owner ? <PointIcon sx={{ position: 'absolute', top: 0, right: -9 }} /> : null}
        </Stack>
    )
}
