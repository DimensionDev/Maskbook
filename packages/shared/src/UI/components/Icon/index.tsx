import { memo, useState } from 'react'
import { Avatar, AvatarProps, useTheme } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import NO_IMAGE_COLOR from './constants.js'

const useStyles = makeStyles()((theme) => ({
    icon: {
        margin: 0,
        borderRadius: '50%',
    },
}))

export interface IconProps extends withClasses<'icon'> {
    name?: string
    logoURL?: string
    AvatarProps?: Partial<AvatarProps>
}

export const Icon = memo<IconProps>((props) => {
    const { logoURL, AvatarProps, name } = props
    const [error, setError] = useState(false)

    // add background color to no-img token icon
    const defaultBackgroundColorNumber = name?.split('')?.reduce((total, cur) => total + Number(cur?.charCodeAt(0)), 0)
    const defaultBackgroundColor = defaultBackgroundColorNumber
        ? NO_IMAGE_COLOR[defaultBackgroundColorNumber % 5]
        : undefined
    const classes = useStylesExtends(useStyles(), props)
    const theme = useTheme()

    return (
        <Avatar
            className={classes.icon}
            src={logoURL}
            {...AvatarProps}
            imgProps={{
                onError: () => {
                    setError(true)
                },
            }}
            sx={{
                ...AvatarProps?.sx,
                backgroundColor: logoURL && !error ? theme.palette.common.white : defaultBackgroundColor,
            }}>
            {name?.slice(0, 1).toUpperCase()}
        </Avatar>
    )
})
