import { Icons, GeneratedIconProps } from '@masknet/icons'
import { makeStyles } from '../../UIHelper'

const useStyles = makeStyles()((theme) => ({
    animated: {
        color: theme.palette.maskColor.bottom,
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
}))

export const LoadingAnimation = (props: GeneratedIconProps) => {
    const { classes, cx } = useStyles()
    return <Icons.CircleLoading {...props} className={cx(classes.animated, props.className)} />
}

export const CircleLoadingAnimation = (props: GeneratedIconProps) => {
    const { classes, cx } = useStyles()
    return <Icons.CircleLoading {...props} className={cx(classes.animated, props.className)} />
}
