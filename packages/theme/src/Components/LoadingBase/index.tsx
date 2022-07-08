import { CircleLoadingIcon } from '@masknet/icons'
import type { SvgIconProps } from '@mui/material'
import { makeStyles } from '../../UIHelper'

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

export const LoadingBase = (props: SvgIconProps) => {
    const { classes } = useStyles()
    return <CircleLoadingIcon {...props} className={`${classes.animated} ${props.className}`} />
}
