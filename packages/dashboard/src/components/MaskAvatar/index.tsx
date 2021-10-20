import { Avatar } from '@material-ui/core'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { MenuPersonasActiveIcon } from '@masknet/icons'
import { memo } from 'react'
import { usePersonaAvatar } from '../../pages/Personas/api'
import { Box } from '@mui/system'

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
        return (
            <Box borderRadius="50%" sx={{ background: MaskColorVar.lightBackground }} height={size}>
                <MenuPersonasActiveIcon {...commonProps} />
            </Box>
        )
    }

    return <Avatar src={avatar} {...commonProps} />
})
