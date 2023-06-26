import { memo, useState } from 'react'
import { Avatar, type AvatarProps, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { name2Image } from './name2Image.js'

const useStyles = makeStyles<Pick<IconProps, 'size'>>()((theme, { size }) => ({
    icon: {
        margin: 0,
        borderRadius: '50%',
        color: `${theme.palette.maskColor.dark} !important`,
        backgroundSize: 'cover',
        height: size,
        width: size,
    },
}))

export interface IconProps {
    color?: string
    size?: number | string
    name?: string
    label?: string
    logoURL?: string
    className?: string
    AvatarProps?: Partial<AvatarProps>
}

export const Icon = memo<IconProps>(function Icon(props) {
    const { logoURL, AvatarProps, size, color, name, label, className } = props
    const [failed, setFailed] = useState(false)

    const defaultBackgroundImage = name2Image(name)
    const { classes, cx } = useStyles({ size })
    const theme = useTheme()

    const showImage = logoURL && !failed

    return (
        <Avatar
            className={cx(classes.icon, className)}
            src={logoURL}
            {...AvatarProps}
            imgProps={{
                onError: () => {
                    setFailed(true)
                },
            }}
            sx={{
                ...AvatarProps?.sx,
                backgroundImage: showImage ? undefined : `url("${defaultBackgroundImage}")`,
                backgroundColor: showImage ? color ?? theme.palette.common.white : undefined,
            }}>
            {label ?? name?.slice(0, 1).toUpperCase()}
        </Avatar>
    )
})

Icon.displayName = 'Icon'
