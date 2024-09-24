import { Suspense, type ReactNode } from 'react'
import { alpha, Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { SnapshotCard } from './SnapshotCard.js'
import { range } from 'lodash-es'

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
        title: ReactNode
    }>,
) {
    const { classes, theme } = useStyles()
    return (
        <Suspense
            fallback={
                <SnapshotCard title={props.title}>
                    {range(2).map((i) => (
                        <Skeleton
                            key={i}
                            className={classes.skeleton}
                            sx={{ backgroundColor: alpha(theme.palette.maskColor.publicMain, 0.6) }}
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
