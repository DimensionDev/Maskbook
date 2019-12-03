import React from 'react'
import { useHistory, useRouteMatch, RouteProps, RouteComponentProps } from 'react-router'
import { Dialog, Toolbar, IconButton, Slide, Container } from '@material-ui/core'
import { TransitionProps } from '@material-ui/core/transitions'
import CloseIcon from '@material-ui/icons/Close'

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})
export default function FullScreenDialogRouter(props: {
    path: string | RouteProps
    component: React.ComponentType<any>
}) {
    const { component: Component, path } = props
    const history = useHistory()
    const routeMatching = !!useRouteMatch(path)

    const onExit = () => {
        history.replace('/')
    }

    return (
        <Dialog
            closeAfterTransition
            onExited={onExit}
            fullScreen
            open={routeMatching}
            onClose={onExit}
            TransitionComponent={Transition}>
            <Toolbar>
                <IconButton style={{ marginLeft: 'auto' }} color="inherit" onClick={onExit} aria-label="close">
                    <CloseIcon />
                </IconButton>
            </Toolbar>
            <Container maxWidth="md">
                <Component></Component>
            </Container>
        </Dialog>
    )
}
