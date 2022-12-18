import { xmasBackground } from '@masknet/shared'
import { LoadingBase, makeStyles, useStylesExtends } from '@masknet/theme'
import { CardContent, Stack, Typography } from '@mui/material'
import { useI18N } from '../../../../utils/index.js'
import { PluginHeader } from './PluginHeader.js'
import { TrendingCard, TrendingCardProps } from './TrendingCard.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), url(${xmasBackground})`,
        backgroundColor: 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
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
    const { classes } = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    return (
        <TrendingCard {...TrendingCardProps}>
            <Stack className={classes.root}>
                <PluginHeader />
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
