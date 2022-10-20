import { memo, useState } from 'react'
import { Avatar, AvatarProps, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { name2Image } from './name2Image.js'

const useStyles = makeStyles<Pick<IconProps, 'size'>>()((theme, { size }) => ({
    icon: {
        margin: 0,
        borderRadius: '50%',
        color: theme.palette.maskColor.dark,
        backgroundSize: 'cover',
        height: size,
        width: size,
    },
}))

export interface IconProps {
    size?: number | string
    name?: string
    label?: string
    disableLabel?: boolean
    logoURL?: string
    className?: string
    AvatarProps?: Partial<AvatarProps>
}

export const Icon = memo<IconProps>((props) => {
    const { logoURL, AvatarProps, size, name, label, disableLabel, className } = props
    const [error, setError] = useState(false)

    const defaultBackgroundImage = name2Image(name)
    const { classes, cx } = useStyles({ size })
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
            {/* Will fallback to default avatar icon if it's null */}
            {disableLabel ? '' : label ?? name?.slice(0, 1).toUpperCase()}
        </Avatar>
    )
})
