import { Suspense } from 'react'
import { Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { AllblueCard } from './AllblueCard'

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

export function LoadingCard(props: React.PropsWithChildren<{ title: string }>) {
    const { classes } = useStyles()
    return (
        <Suspense
            fallback={
                <AllblueCard title={props.title}>
                    {Array.from({ length: 2 })
                        .fill(0)
                        .map((_, i) => (
                            <Skeleton
                                key={i}
                                className={classes.skeleton}
                                animation="wave"
                                variant="rectangular"
                                width={i === 0 ? '80%' : '60%'}
                                height={15}
                            />
                        ))}
                </AllblueCard>
            }>
            {props.children}
        </Suspense>
    )
}
