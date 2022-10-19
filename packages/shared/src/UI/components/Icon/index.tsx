import { memo, useState } from 'react'
import { Avatar, AvatarProps, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { name2Image } from './name2Image.js'

const useStyles = makeStyles()((theme) => ({
    icon: {
        margin: 0,
        borderRadius: '50%',
        color: theme.palette.maskColor.dark,
        backgroundSize: 'cover',
    },
}))

export interface IconProps {
    name?: string
    label?: string
    logoURL?: string
    className?: string
    AvatarProps?: Partial<AvatarProps>
}

export const Icon = memo<IconProps>((props) => {
    const { logoURL, AvatarProps, name, label, className } = props
    const [error, setError] = useState(false)

    const defaultBackgroundImage = name2Image(name)
    const { classes, cx } = useStyles()
    const theme = useTheme()

    const showImage = logoURL && !error

    return (
        <Avatar
            className={cx(classes.icon, className)}
            src={logoURL}
            {...AvatarProps}
            imgProps={{
                onError: () => {
                    setError(true)
                },
            }}
            sx={{
                ...AvatarProps?.sx,
                backgroundImage: `url("${defaultBackgroundImage}")`,
                backgroundColor: showImage ? theme.palette.common.white : undefined,
            }}>
            {label ?? name?.slice(0, 1).toUpperCase()}
        </Avatar>
    )
})
