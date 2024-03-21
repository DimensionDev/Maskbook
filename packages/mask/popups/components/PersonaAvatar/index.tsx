import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Avatar } from '@mui/material'
import { EmojiAvatar } from '@masknet/shared'

const useStyles = makeStyles()(() => ({
    root: {
        borderRadius: '50%',
    },
}))

interface PersonaAvatarProps extends withClasses<'root'> {
    pubkey: string
    avatar?: string | null
    size: number
}

export const PersonaAvatar = memo<PersonaAvatarProps>(function PersonaAvatar({ size, pubkey, avatar, ...rest }) {
    const { classes } = useStyles(undefined, { props: rest })

    if (avatar) return <Avatar src={avatar} style={{ width: size, height: size }} className={classes.root} />

    return <EmojiAvatar size={size} value={pubkey} />
})
