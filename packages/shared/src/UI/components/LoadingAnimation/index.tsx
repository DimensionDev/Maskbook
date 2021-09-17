import { LoadingIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import type { SvgIconProps } from '@mui/material'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    '@global': {
        '@keyframes loadingAnimation': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(360deg)',
            },
        },
    },
    animated: {
        animation: `loadingAnimation 1.6s linear infinite`,
    },
}))

export const LoadingAnimation = (props: SvgIconProps) => {
    const { classes } = useStyles()
    return <LoadingIcon className={classNames(classes.animated, props.className)} {...props} />
}
