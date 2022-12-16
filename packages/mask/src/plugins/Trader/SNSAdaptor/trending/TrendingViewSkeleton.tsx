import { LoadingBase, makeStyles } from '@masknet/theme'
import { CardContent, Stack, Typography } from '@mui/material'
import { useI18N } from '../../../../utils/index.js'
import { PluginDescriptor } from './PluginDescriptor.js'
import { TrendingCard, TrendingCardProps } from './TrendingCard.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
        background: theme.palette.maskColor.modalTitleBg,
    },
    content: {
        height: 162,
        paddingTop: 0,
        paddingBottom: 0,
    },
}))

export interface TrendingViewSkeletonProps extends withClasses<'content' | 'footer'> {
    TrendingCardProps?: Partial<TrendingCardProps>
}

export function TrendingViewSkeleton(props: TrendingViewSkeletonProps) {
    const { TrendingCardProps } = props
    const { classes } = useStyles(undefined, { props })
    const { t } = useI18N()

    return (
        <TrendingCard {...TrendingCardProps}>
            <Stack className={classes.root}>
                <PluginDescriptor />
                <CardContent className={classes.content}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <LoadingBase />
                        <Typography fontSize="14px" mt={1.5}>
                            {t('loading')}
                        </Typography>
                    </Stack>
                </CardContent>
            </Stack>
        </TrendingCard>
    )
}
