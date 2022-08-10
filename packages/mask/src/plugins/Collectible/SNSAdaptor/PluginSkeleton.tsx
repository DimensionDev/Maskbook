import { Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { range } from 'lodash-unified'

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
            {range(2).map((i) => (
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
