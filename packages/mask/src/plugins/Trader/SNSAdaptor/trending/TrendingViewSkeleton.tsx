import { LoadingBase, makeStyles } from '@masknet/theme'
import { CardContent, Stack, Typography } from '@mui/material'
import { useI18N } from '../../../../utils/index.js'
import { useContext } from 'react'
import { TrendingViewContext } from './context.js'
import { PluginDescriptor } from './PluginDescriptor.js'
import { TrendingCard, TrendingCardProps } from './TrendingCard.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 1.5),
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
    const { isNFTProjectPopper, isProfilePage, isTokenTagPopper } = useContext(TrendingViewContext)
    const { classes } = useStyles(undefined, { props })
    const { t } = useI18N()

    return (
        <TrendingCard {...TrendingCardProps}>
            <Stack className={classes.root}>
                {isNFTProjectPopper || isTokenTagPopper ? null : (
                    <PluginDescriptor
                        isNFTProjectPopper={isNFTProjectPopper}
                        isProfilePage={isProfilePage}
                        isTokenTagPopper={isTokenTagPopper}
                    />
                )}
                <CardContent className={classes.content}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <LoadingBase />
                        <Typography fontSize="14px" mt={1.5}>
                            {t('loading')}
                        </Typography>
                    </Stack>
                </CardContent>
                {isNFTProjectPopper || isTokenTagPopper ? (
                    <PluginDescriptor
                        isNFTProjectPopper={isNFTProjectPopper}
                        isProfilePage={isProfilePage}
                        isTokenTagPopper={isTokenTagPopper}
                    />
                ) : null}
            </Stack>
        </TrendingCard>
    )
}
