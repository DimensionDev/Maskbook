import { Suspense } from 'react'
import { makeStyles, Skeleton } from '@material-ui/core'
import { SnapshotCard } from './SnapshotCard'

const useStyles = makeStyles((theme) => {
    return {
        skeleton: {
            margin: theme.spacing(1),
            '&:first-child': {
                marginTop: theme.spacing(2),
            },
        },
    }
})

export function LoadingCard(props: React.PropsWithChildren<{ title: string }>) {
    const classes = useStyles()
    return (
        <Suspense
            fallback={
                <SnapshotCard title={props.title}>
                    {new Array(2).fill(0).map((_, i) => (
                        <Skeleton
                            key={i}
                            className={classes.skeleton}
                            animation="wave"
                            variant="rectangular"
                            width={i === 0 ? '80%' : '60%'}
                            height={15}
                        />
                    ))}
                </SnapshotCard>
            }>
            {props.children}
        </Suspense>
    )
}
