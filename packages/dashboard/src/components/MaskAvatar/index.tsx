import { useAvatar } from '../../pages/Settings/api'
import { Avatar } from '@material-ui/core'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { AuthorIcon } from '@masknet/icons'
import { memo } from 'react'

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
    const avatar = useAvatar()
    const commonProps = { sx: { width: size, height: size }, onClick: onClick, className: classes.author }

    if (!avatar) {
        return <AuthorIcon {...commonProps} />
    }

    return <Avatar src={avatar} {...commonProps} />
})
