import {
    useMediaQuery,
    Toolbar as MuiToolbar,
    Theme,
    Typography,
    AppBar,
    Grid,
    IconButton,
    Drawer,
    experimentalStyled as styled,
    Box,
    toolbarClasses,
    Backdrop,
    paperClasses,
} from '@material-ui/core'
import { Menu as MenuIcon, Close as CloseIcon } from '@material-ui/icons'
import Color from 'color'
import { ErrorBoundary } from '@dimensiondev/maskbook-theme'
import { useState, useContext, useMemo } from 'react'
import { DashboardContext } from './context'
import { Navigation } from './Navigation'
import { MaskNotSquareIcon } from '@dimensiondev/icons'
import { memo } from 'react'

const Root = styled(Grid)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
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
                    <ErrorBoundary>{props.children}</ErrorBoundary>
                </Grid>
            </Root>
        </DashboardContext.Provider>
    )
})

const MaskLogo = styled(Grid)`
    flex-basis: 212px;
    max-width: 212px;
    & > svg {
        flex: 1;
    }
`

const Toolbar = styled(MuiToolbar)(({ theme }) => ({
    [`&.${toolbarClasses.gutters}`]: {
        [theme.breakpoints.up('lg')]: {
            paddingLeft: theme.spacing(0),
        },
        [theme.breakpoints.down('lg')]: {
            paddingLeft: theme.spacing(1),
        },
    },
}))

const MenuButton = styled(IconButton)(({ theme }) => ({
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
}))

const PageTitle = styled(Grid)(({ theme }) => ({
    minHeight: 40,
    alignItems: 'center',
    paddingLeft: theme.spacing(4.25),
    [theme.breakpoints.down('lg')]: {
        flex: 1,
    },
}))

const Containment = styled(Grid)(({ theme }) => ({
    overflow: 'auto',
    contain: 'strict',
    [theme.breakpoints.down('lg')]: {
        minHeight: '100vh',
    },
}))

const NavigationDrawer = styled(Drawer)(({ theme }) => ({
    top: `${theme.mixins.toolbar.minHeight}px !important`,
    // https://github.com/mui-org/material-ui/issues/20012#issuecomment-770654893
    [`& > .${paperClasses.root}`]: {
        width: 232,
        top: theme.mixins.toolbar.minHeight,
        paddingTop: theme.spacing(7.5),
        background: new Color(theme.palette.background.paper).alpha(0.8).toString(),
        backdropFilter: 'blur(4px)',
    },
}))
const NavigationDrawerBackdrop = styled(Backdrop)(({ theme }) => ({
    top: theme.mixins.toolbar.minHeight,
}))

const ShapeHelper = styled('div')(({ theme }) => ({
    height: '100%',
    padding: theme.spacing(2),
    borderTopLeftRadius: Number(theme.shape.borderRadius) * 5,
    borderTopRightRadius: Number(theme.shape.borderRadius) * 5,
    backgroundColor: theme.palette.background.default,
    paddingBottom: 0,
}))

const ShapeContainer = styled('div')(({ theme }) => ({
    height: '100%',
    padding: theme.spacing(2),
    borderTopLeftRadius: Number(theme.shape.borderRadius) * 5,
    borderTopRightRadius: Number(theme.shape.borderRadius) * 5,
    backgroundColor: theme.palette.background.paper,
}))

export interface PageFrameProps extends React.PropsWithChildren<{}> {
    title: React.ReactNode | string
    primaryAction?: React.ReactNode
}

export const PageFrame = memo((props: PageFrameProps) => {
    const left = typeof props.title === 'string' ? <Typography variant="h6">{props.title}</Typography> : props.title
    const right = props.primaryAction
    const isLargeScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'))
    const { drawerOpen, toggleDrawer } = useContext(DashboardContext)

    return (
        <>
            <AppBar position="relative" color="inherit" elevation={0}>
                <Toolbar>
                    {!isLargeScreen && (
                        <MaskLogo item container alignItems="center">
                            <MenuButton onClick={toggleDrawer}>{drawerOpen ? <CloseIcon /> : <MenuIcon />}</MenuButton>
                            <MaskNotSquareIcon />
                        </MaskLogo>
                    )}
                    <PageTitle item xs={isLargeScreen ? 12 : 10} container>
                        {left}
                        <Box sx={{ flex: 1 }} />
                        {right}
                    </PageTitle>
                </Toolbar>
            </AppBar>
            <Containment item xs>
                {!isLargeScreen && (
                    <NavigationDrawer
                        open={drawerOpen}
                        onClose={toggleDrawer}
                        BackdropComponent={NavigationDrawerBackdrop}
                        BackdropProps={{ invisible: true }}
                        variant="temporary"
                        PaperProps={{ elevation: 0 }}>
                        <Navigation />
                    </NavigationDrawer>
                )}
                <ShapeHelper>
                    <ShapeContainer>
                        <ErrorBoundary>{props.children}</ErrorBoundary>
                    </ShapeContainer>
                </ShapeHelper>
            </Containment>
        </>
    )
})
