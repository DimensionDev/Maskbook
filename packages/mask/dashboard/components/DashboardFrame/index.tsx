import { ErrorBoundary } from '@masknet/shared-base-ui'
import { MaskColorVar } from '@masknet/theme'
import { Grid, styled, type Theme, useMediaQuery } from '@mui/material'
import { memo, Suspense, useMemo, useState, type PropsWithChildren } from 'react'
import { FollowUs } from '../FollowUs/index.js'
import { NavigationVersionFooter } from '../NavigationVersionFooter/index.js'
import { DashboardContext } from './context.js'
import { Navigation } from './Navigation.js'

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

export interface DashboardFrameProps extends PropsWithChildren<{}> {}

export const DashboardFrame = memo((props: DashboardFrameProps) => {
    const isLargeScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'))
    const [navigationExpanded, setNavigationExpanded] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)

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
                {isLargeScreen ? (
                    <LeftContainer item xs={2}>
                        <Navigation />
                        <div>
                            <FollowUs />
                            <NavigationVersionFooter />
                        </div>
                    </LeftContainer>
                ) : null}
                <Grid container direction="column" item xs={isLargeScreen ? 10 : 12}>
                    <Suspense fallback={null}>
                        <ErrorBoundary>{props.children}</ErrorBoundary>
                    </Suspense>
                </Grid>
            </Root>
        </DashboardContext.Provider>
    )
})

DashboardFrame.displayName = 'DashboardFrame'
