import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Avatar } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {
        borderRadius: '50%',
    },
}))

export interface PersonaAvatarProps extends withClasses<'root'> {
    avatar?: string | null
    hasProofs?: boolean
    size: number
}

export const PersonaAvatar = memo<PersonaAvatarProps>(function PersonaAvatar({ size, hasProofs, avatar, ...rest }) {
    const { classes } = useStyles(undefined, { props: rest })
    if (hasProofs) return <Icons.NextIdAvatar size={size} className={classes.root} />

    if (avatar) return <Avatar src={avatar} style={{ width: size, height: size }} className={classes.root} />

    return <Icons.MenuPersonasActive size={size} className={classes.root} />
})
