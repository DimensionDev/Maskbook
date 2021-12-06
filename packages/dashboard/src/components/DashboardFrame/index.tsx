import { memo, Suspense, useMemo, useState } from 'react'
// see https://github.com/import-js/eslint-plugin-import/issues/2288
// eslint-disable-next-line import/no-deprecated
import { Grid, styled, Theme, useMediaQuery } from '@mui/material'
import { MaskColorVar } from '@masknet/theme'
import { ErrorBoundary } from '@masknet/shared'
import { DashboardContext } from './context'
import { Navigation } from './Navigation'

const Root = styled(Grid)(({ theme }) => ({
    backgroundColor: MaskColorVar.primaryBackground,
}))

const LeftContainer = styled(Grid)(({ theme }) => ({
    height: '100vh',
    [theme.breakpoints.up('lg')]: {
        // Just meet the design size
        minWidth: 232,
    },
}))

export interface DashboardFrameProps extends React.PropsWithChildren<{}> {}

export const DashboardFrame = memo((props: DashboardFrameProps) => {
    // see https://github.com/import-js/eslint-plugin-import/issues/2288
    // eslint-disable-next-line import/no-deprecated
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
