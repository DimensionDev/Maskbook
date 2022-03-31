import { Avatar } from '@mui/material'

interface NFTAvatarProps {
    hasBorder: boolean
    avatar?: string
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { avatar, hasBorder } = props
    return (
        <div>
            <Avatar src={avatar} />
        </div>
    )
}
