import { Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        skeleton: {
            margin: theme.spacing(2),
            '&:first-child': {
                marginTop: theme.spacing(3),
            },
        },
    }
})

export function PluginSkeleton() {
    const { classes } = useStyles()
    return (
        <>
            {Array.from({ length: 2 })
                .fill(0)
                .map((_, i) => (
                    <Skeleton
                        className={classes.skeleton}
                        key={i}
                        animation="wave"
                        variant="rectangular"
                        width={i === 0 ? '80%' : '60%'}
                        height={15}
                    />
                ))}
        </>
    )
}
