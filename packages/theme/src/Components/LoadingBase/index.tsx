import { GeneratedIconProps, Icons } from '@masknet/icons'
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

export const LoadingBase = (props: GeneratedIconProps) => {
    const { classes } = useStyles()
    return <Icons.CircleLoading {...props} className={`${classes.animated} ${props.className}`} />
}
