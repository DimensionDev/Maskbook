import { Avatar } from '@material-ui/core'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { MenuPersonasActiveIcon } from '@masknet/icons'
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
        sx: { width: size, height: size, display: 'inline-block' },
        onClick: onClick,
        className: classes.author,
    }

    if (!avatar) {
        return <MenuPersonasActiveIcon {...commonProps} />
    }

    return <Avatar src={avatar} {...commonProps} />
})
