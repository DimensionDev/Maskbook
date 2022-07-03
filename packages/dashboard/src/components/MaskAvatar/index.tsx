import { Avatar, Stack } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { MenuPersonasActive as MenuPersonasActiveIcon } from '@masknet/icons'
import { memo } from 'react'
import { usePersonaAvatar } from '../../pages/Personas/api'

const useStyles = makeStyles()((theme) => ({
    author: {
        fill: MaskColorVar.secondaryBackground,
        cursor: 'pointer',
    },
}))

interface MaskAvatarProps {
    size?: number
    onClick?(): void
}

export const MaskAvatar = memo<MaskAvatarProps>(({ size = 36, onClick }) => {
    const { classes } = useStyles()
    const avatar = usePersonaAvatar()
    const commonProps = {
        sx: {
            width: size,
            height: size,
            display: 'inline-block',
            background: MaskColorVar.lightBackground,
            borderRadius: '50%',
        },
        onClick,
        className: classes.author,
    }

    if (!avatar) {
        return (
            <Stack justifyContent="center" width="100%" height={size} flexDirection="row">
                <MenuPersonasActiveIcon size={size} {...commonProps} />
            </Stack>
        )
    }

    return <Avatar src={avatar} {...commonProps} />
})
