import { Icon, IconProps } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'

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
        animation: 'loadingAnimation 1.6s linear infinite',
    },
})

export const LoadingAnimation = (props: IconProps) => {
    const { classes, cx } = useStyles()
    return <Icon type="circleLoading" {...props} className={cx(classes.animated, props.className)} />
}

export const CircleLoadingAnimation = (props: IconProps) => {
    const { classes, cx } = useStyles()
    return <Icon type="circleLoading" {...props} className={cx(classes.animated, props.className)} />
}
