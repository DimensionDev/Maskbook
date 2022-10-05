import { EnhanceableSite } from '@masknet/shared-base'
import { Avatar, Box, Stack } from '@mui/material'
import { PointIcon } from '../assets/PointIcon.js'
import { TwitterIcon } from '../assets/TwitterIcon.js'
import { RainbowBox } from '../SNSAdaptor/RainbowBox.js'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<string, React.ReactNode> = {
    [EnhanceableSite.Twitter]: <TwitterIcon style={{ width: 15, height: 15 }} />,
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
                <Box style={{ border: '2px solid transparent' }}>
                    <Avatar src={avatar} />
                </Box>
            )}

            <Stack
                sx={{
                    position: 'absolute',
                    right: -3,
                    bottom: 0,
                    overflow: 'hidden',
                    borderRadius: '100%',
                    backgroundColor: 'white',
                }}>
                {SOCIAL_MEDIA_ICON_MAPPING[EnhanceableSite.Twitter]}
            </Stack>
            {owner ? <PointIcon sx={{ position: 'absolute', top: 1, right: 6, width: 8, height: 8 }} /> : null}
        </Stack>
    )
}
