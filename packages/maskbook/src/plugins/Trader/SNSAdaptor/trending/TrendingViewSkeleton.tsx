import { CardHeader, CardContent, CardActions, Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { TrendingCard, TrendingCardProps } from './TrendingCard'

const useStyles = makeStyles()({
    content: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    footer: {
        justifyContent: 'space-between',
    },
})

export interface TrendingViewSkeletonProps extends withClasses<'content' | 'footer'> {
    TrendingCardProps?: Partial<TrendingCardProps>
}

export function TrendingViewSkeleton(props: TrendingViewSkeletonProps) {
    const { TrendingCardProps } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <TrendingCard {...TrendingCardProps}>
            <CardHeader
                avatar={<Skeleton animation="wave" variant="circular" width={40} height={40} />}
                title={<Skeleton animation="wave" height={10} width="30%" />}
                subheader={<Skeleton animation="wave" height={10} width="20%" />}
            />
            <CardContent className={classes.content}>
                <Skeleton animation="wave" variant="rectangular" height={58} style={{ marginBottom: 8 }} />
                <Skeleton animation="wave" variant="rectangular" height={269} />
            </CardContent>
            <CardActions className={classes.footer}>
                <Skeleton animation="wave" height={10} width="30%" />
            </CardActions>
        </TrendingCard>
    )
}
