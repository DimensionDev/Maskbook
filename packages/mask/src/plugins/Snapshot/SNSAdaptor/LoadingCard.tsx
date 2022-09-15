import { Suspense } from 'react'
import { Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { SnapshotCard } from './SnapshotCard.js'
import { range } from 'lodash-unified'

const useStyles = makeStyles()((theme) => {
    return {
        skeleton: {
            margin: theme.spacing(1),
            '&:first-child': {
                marginTop: theme.spacing(2),
            },
        },
    }
})

export function LoadingCard(
    props: React.PropsWithChildren<{
        title: string
    }>,
) {
    const { classes } = useStyles()
    return (
        <Suspense
            fallback={
                <SnapshotCard title={props.title}>
                    {range(2).map((i) => (
                        <Skeleton
                            key={i}
                            className={classes.skeleton}
                            sx={{ backgroundColor: 'gray' }}
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
