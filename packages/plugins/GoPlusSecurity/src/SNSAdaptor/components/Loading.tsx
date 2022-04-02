import { makeStyles } from '@masknet/theme'
import type { SvgIconProps } from '@mui/material'
import { LoadingIcon } from '../icons/Loading'

const useStyles = makeStyles()({
    animated: {
        '@keyframes loadingAnimation': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(360deg)',
            },
        },
        animation: 'loadingAnimation 1s linear infinite',
    },
})

export const LoadingAnimation = (props: SvgIconProps) => {
    const { classes } = useStyles()
    return <LoadingIcon {...props} className={`${classes.animated} ${props.className}`} />
}
