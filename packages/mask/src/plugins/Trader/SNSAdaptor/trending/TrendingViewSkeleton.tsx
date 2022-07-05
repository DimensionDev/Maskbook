import { LoadingBase, makeStyles, useStylesExtends } from '@masknet/theme'
import { TrendingCard, TrendingCardProps } from './TrendingCard'
import { PluginHeader } from './PluginHeader'
import { ProvidedBy } from '@masknet/shared'
import { CardContent, Stack, Typography } from '@mui/material'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
        background: theme.palette.background.modalTitle,
    },
    content: {
        height: 162,
        paddingTop: 0,
        paddingBottom: 0,
    },
    footer: {
        justifyContent: 'space-between',
    },
}))

export interface TrendingViewSkeletonProps extends withClasses<'content' | 'footer'> {
    TrendingCardProps?: Partial<TrendingCardProps>
}

export function TrendingViewSkeleton(props: TrendingViewSkeletonProps) {
    const { TrendingCardProps } = props
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()

    return (
        <TrendingCard {...TrendingCardProps}>
            <Stack className={classes.root}>
                <PluginHeader>
                    <ProvidedBy providerName="Mask Network" providerLink="https://mask.io" />
                </PluginHeader>
                <CardContent className={classes.content}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <LoadingBase fontSize="large" />
                        <Typography fontSize="14px" mt={1.5}>
                            {t('loading')}
                        </Typography>
                    </Stack>
                </CardContent>
            </Stack>
        </TrendingCard>
    )
}
