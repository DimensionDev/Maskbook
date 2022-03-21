import { memo, Suspense, useMemo, useState } from 'react'
import { Grid, styled, Theme, useMediaQuery } from '@mui/material'
import { MaskColorVar } from '@masknet/theme'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { DashboardContext } from './context'
import { Navigation } from './Navigation'
import { NavigationVersionFooter } from '../NavigationVersionFooter'

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

export interface DashboardFrameProps extends React.PropsWithChildren<{}> {}

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
                {isLargeScreen && (
                    <LeftContainer item xs={2}>
                        <Navigation />
                        <NavigationVersionFooter />
                    </LeftContainer>
                )}
                <Grid container direction="column" item xs={isLargeScreen ? 10 : 12}>
                    <Suspense fallback={null}>
                        <ErrorBoundary>{props.children}</ErrorBoundary>
                    </Suspense>
                </Grid>
            </Root>
        </DashboardContext.Provider>
    )
})
