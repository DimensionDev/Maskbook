import { ErrorBoundary } from '@masknet/shared-base-ui'
import { LoadingBase, MaskColorVar } from '@masknet/theme'
import { Grid, styled, Theme, useMediaQuery } from '@mui/material'
import { memo, Suspense, useMemo, useState } from 'react'
import { FollowUs } from '../FollowUs/index.js'
import { NavigationVersionFooter } from '../NavigationVersionFooter/index.js'
import { DashboardContext } from './context.js'
import { Navigation } from './Navigation.js'
import { useLogGuard } from './useLogGuard.js'

const Root = styled(Grid)(({ theme }) => ({
    backgroundColor: MaskColorVar.primaryBackground,
}))

const LeftContainer = styled(Grid)(({ theme }) => ({
    height: '100vh',
    [theme.breakpoints.up('lg')]: {
        // Just meet the design size
        minWidth: 232,
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: '22px',
}))

const Overlay = styled('div')(({ theme }) => ({
    position: 'fixed',
    inset: 0,
    margin: 'auto',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}))

export interface DashboardFrameProps extends React.PropsWithChildren<{}> {}

export const DashboardFrame = memo((props: DashboardFrameProps) => {
    const isLargeScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'))
    const [navigationExpanded, setNavigationExpanded] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const { loading: checking } = useLogGuard()

    const context = useMemo(
        () => ({
            drawerOpen,
            expanded: navigationExpanded,
            toggleNavigationExpand: () => setNavigationExpanded((e) => !e),
            toggleDrawer: () => setDrawerOpen((e) => !e),
        }),
        [drawerOpen, navigationExpanded],
    )

    return (
        <DashboardContext.Provider value={context}>
            <Root container>
                {isLargeScreen && (
                    <LeftContainer item xs={2}>
                        <Navigation />
                        <div>
                            <FollowUs />
                            <NavigationVersionFooter />
                        </div>
                    </LeftContainer>
                )}
                <Grid container direction="column" item xs={isLargeScreen ? 10 : 12}>
                    <Suspense fallback={null}>
                        <ErrorBoundary>{props.children}</ErrorBoundary>
                    </Suspense>
                </Grid>
            </Root>
            {checking ? (
                <Overlay>
                    <LoadingBase size={64} />
                </Overlay>
            ) : null}
        </DashboardContext.Provider>
    )
})

DashboardFrame.displayName = 'DashboardFrame'
