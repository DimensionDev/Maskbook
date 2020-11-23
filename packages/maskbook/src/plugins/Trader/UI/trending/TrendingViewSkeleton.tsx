import { makeStyles, CardHeader, CardContent, CardActions, Theme, createStyles } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import { TrendingCard, TrendingCardProps } from './TrendingCard'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        content: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        footer: {
            justifyContent: 'space-between',
        },
    })
})

export interface TrendingViewSkeletonProps {
    TrendingCardProps?: Partial<TrendingCardProps>
}

export function TrendingViewSkeleton(props: TrendingViewSkeletonProps) {
    const { TrendingCardProps } = props
    const classes = useStyles()

    return (
        <TrendingCard {...TrendingCardProps}>
            <CardHeader
                avatar={<Skeleton animation="wave" variant="circle" width={40} height={40} />}
                title={<Skeleton animation="wave" height={10} width="30%" />}
                subheader={<Skeleton animation="wave" height={10} width="20%" />}
            />
            <CardContent className={classes.content}>
                <Skeleton animation="wave" variant="rect" height={58} style={{ marginBottom: 8 }} />
                <Skeleton animation="wave" variant="rect" height={254} />
            </CardContent>
            <CardActions className={classes.footer}>
                <Skeleton animation="wave" height={10} width="30%" />
            </CardActions>
        </TrendingCard>
    )
}
