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
    ToolbarProps,
} from '@material-ui/core'
import { Menu as MenuIcon, Close as CloseIcon } from '@material-ui/icons'
import Color from 'color'
import { ErrorBoundary } from '@dimensiondev/maskbook-theme'
import { useState, useContext } from 'react'
import { DashboardContext } from './context'
import { Navigation } from './Navigation'
import Logo from './Logo'

const Root = styled(Grid)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}))

const LeftContainer = styled(Grid)(({ theme }) => ({
    height: '100vh',
    [theme.breakpoints.up('lg')]: {
        minWidth: 232,
    },
}))

const RightContainer = styled(Grid)(({ theme }) => ({
    flex: 1,
}))

export interface DashboardFrameProps extends React.PropsWithChildren<{}> {}

export function DashboardFrame(props: DashboardFrameProps) {
    const matches = useMediaQuery<Theme>((theme) => theme.breakpoints.down('lg'))
    const [navigationExpanded, setNavigationExpanded] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <DashboardContext.Provider
            value={{
                drawerOpen,
                expanded: navigationExpanded,
                toggleNavigationExpand: () => setNavigationExpanded((e) => !e),
                toggleDrawer: () => setDrawerOpen((e) => !e),
            }}>
            <Root container>
                {!matches && (
                    <LeftContainer item xs={2}>
                        <Navigation />
                    </LeftContainer>
                )}
                <RightContainer container direction="column" item xs={matches ? 12 : 10}>
                    <ErrorBoundary>{props.children}</ErrorBoundary>
                </RightContainer>
            </Root>
        </DashboardContext.Provider>
    )
}

const MaskLogo = styled(Grid)`
    flex-basis: 212px;
    max-width: 212px;
    & > svg {
        flex: 1;
    }
`

const Toolbar = styled((props: ToolbarProps) => <MuiToolbar {...props} />)(({ theme }) => ({
    [theme.breakpoints.down('lg')]: {
        '&.MuiToolbar-gutters': {
            paddingLeft: theme.spacing(1),
        },
    },
    [theme.breakpoints.up('lg')]: {
        '&.MuiToolbar-gutters': {
            paddingLeft: theme.spacing(0),
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

const Stuff = styled('div')`
    flex: 1;
`

const Containment = styled(Grid)(({ theme }) => ({
    overflow: 'auto',
    contain: 'strict',
    [theme.breakpoints.down('lg')]: {
        minHeight: '100vh',
    },
}))

const NavigationDrawer = styled(Drawer)(({ theme }) => ({
    top: `${theme.mixins.toolbar.minHeight}px!important`,
    '& .paper': {
        width: 232,
        top: theme.mixins.toolbar.minHeight,
        paddingTop: theme.spacing(7.5),
        background: new Color(theme.palette.background.paper).alpha(0.8).toString(),
        backdropFilter: 'blur(4px)',
    },
    '& .backdrop': {
        top: theme.mixins.toolbar.minHeight,
    },
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

export function PageFrame(props: PageFrameProps) {
    const left = typeof props.title === 'string' ? <Typography variant="h6">{props.title}</Typography> : props.title
    const right = props.primaryAction
    const matches = useMediaQuery<Theme>((theme) => theme.breakpoints.down('lg'))
    const { drawerOpen, toggleDrawer } = useContext(DashboardContext)

    return (
        <>
            <AppBar position="relative" color="inherit" elevation={0}>
                <Toolbar>
                    {matches && (
                        <MaskLogo item container alignItems="center">
                            <MenuButton onClick={toggleDrawer}>{drawerOpen ? <CloseIcon /> : <MenuIcon />}</MenuButton>
                            <Logo height={40} />
                        </MaskLogo>
                    )}
                    <PageTitle item xs={matches ? 10 : 12} container>
                        {left}
                        <Stuff />
                        {right}
                    </PageTitle>
                </Toolbar>
            </AppBar>
            <Containment item xs>
                {matches && (
                    <NavigationDrawer
                        open={drawerOpen}
                        onClose={toggleDrawer}
                        BackdropProps={{ invisible: true }}
                        variant="temporary"
                        ModalProps={{
                            BackdropProps: {
                                className: 'backdrop',
                            },
                        }}
                        PaperProps={{ className: 'paper', elevation: 0 }}>
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
}
