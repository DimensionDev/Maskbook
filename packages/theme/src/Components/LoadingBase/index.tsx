import { GeneratedIconProps, Icons } from '@masknet/icons'
import { makeStyles } from '../../UIHelper'

const useStyles = makeStyles()((theme) => ({
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
}))

export const LoadingBase = (props: GeneratedIconProps) => {
    const { classes, cx } = useStyles()
    return <Icons.CircleLoading {...props} className={cx(classes.animated, props.className)} />
}
