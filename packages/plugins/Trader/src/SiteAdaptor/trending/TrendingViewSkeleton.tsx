import { useContext, type ReactNode } from 'react'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { CardContent, Stack, Typography } from '@mui/material'
import { TrendingViewContext } from './context.js'
import { PluginDescriptor } from './PluginDescriptor.js'
import { TrendingCard, type TrendingCardProps } from './TrendingCard.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 1.5),
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
    },
    content: {
        height: 162,
        paddingTop: 0,
        paddingBottom: 0,
    },
}))

interface TrendingViewSkeletonProps extends withClasses<'content' | 'footer'> {
    TrendingCardProps?: Partial<TrendingCardProps>
    children?: ReactNode
}

export function TrendingViewSkeleton(props: TrendingViewSkeletonProps) {
    const { TrendingCardProps, children } = props
    const { isCollectionProjectPopper, isProfilePage, isTokenTagPopper } = useContext(TrendingViewContext)
    const { classes } = useStyles(undefined, { props })

    return (
        <TrendingCard {...TrendingCardProps}>
            <Stack className={classes.root}>
                {isCollectionProjectPopper || isTokenTagPopper ? null : (
                    <PluginDescriptor
                        isCollectionProjectPopper={isCollectionProjectPopper}
                        isProfilePage={isProfilePage}
                        isTokenTagPopper={isTokenTagPopper}
                    />
                )}
                <CardContent className={classes.content}>
                    {children ?? (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                            <LoadingBase />
                            <Typography fontSize="14px" mt={1.5}>
                                <Trans>Loading</Trans>
                            </Typography>
                        </Stack>
                    )}
                </CardContent>
                {isCollectionProjectPopper || isTokenTagPopper ?
                    <PluginDescriptor
                        isCollectionProjectPopper={isCollectionProjectPopper}
                        isProfilePage={isProfilePage}
                        isTokenTagPopper={isTokenTagPopper}
                    />
                :   null}
            </Stack>
        </TrendingCard>
    )
}
