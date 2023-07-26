import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    loading: {
        display: 'flex',
        columnGap: 4,
        '@keyframes dotLoading': {
            to: {
                opacity: 0.1,
            },
        },
        '& > div': {
            animation: 'dotLoading 0.6s infinite alternate',
        },
        '& > div:nth-child(2)': {
            animationDelay: '0.2s',
        },
        '& > div:nth-child(3)': {
            animationDelay: '0.4s',
        },
    },
    dot: {
        width: 3,
        height: 3,
        backgroundColor: theme.palette.maskColor.main,
    },
}))
export function DotLoading() {
    const { classes } = useStyles()
    return (
        <div className={classes.loading}>
            <div className={classes.dot} />
            <div className={classes.dot} />
            <div className={classes.dot} />
        </div>
    )
}
