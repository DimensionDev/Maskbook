import React from 'react'
import { useHistory, useRouteMatch, RouteProps } from 'react-router'
import {
    Dialog,
    Toolbar,
    Button,
    Grow,
    makeStyles,
    createStyles,
    Divider,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@material-ui/core'
import { TransitionProps } from '@material-ui/core/transitions'
import CloseIcon from '@material-ui/icons/Close'

import classNames from 'classnames'
import { Route } from 'react-router-dom'

const useStyles = makeStyles(theme =>
    createStyles({
        dialog: {
            backgroundColor: '#F7F8FA',
            width: '100%',
        },
        dialogTitle: {
            padding: `${theme.spacing(1)}px ${theme.spacing(4)}px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
        },
        dialogTitleSimplified: {
            padding: `${theme.spacing(2)}px ${theme.spacing(4)}px 0`,
        },
        dialogContent: {
            padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
            lineHeight: 2,
        },
        dialogActions: {
            '& .actionButton': {
                width: 140,
            },
        },
        dialogActionsCenter: {
            justifyContent: 'center',
            marginBottom: theme.spacing(2),
        },
        closeButton: {
            marginRight: theme.spacing(2),
        },
    }),
)

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Grow style={{ transformOrigin: '0 0 0' }} ref={ref} {...props} />
})

interface DialogContentItemProps {
    title: JSX.Element | string
    content: JSX.Element | string
    actions?: JSX.Element | null
    actionsAlign?: 'center'
    simplified?: boolean
    onExit?: string | (() => undefined)
}

export function DialogContentItem(props: DialogContentItemProps) {
    const { title, content, actions, onExit, actionsAlign, simplified } = props
    const classes = useStyles()
    const history = useHistory()

    const onExitAction =
        typeof onExit === 'function'
            ? onExit
            : () => {
                  history.push(onExit || '../')
              }

    return (
        <>
            <DialogTitle className={classNames(classes.dialogTitle, { [classes.dialogTitleSimplified]: simplified })}>
                {!simplified && (
                    <IconButton aria-label="close" className={classes.closeButton} onClick={onExitAction}>
                        <CloseIcon />
                    </IconButton>
                )}
                {title}
            </DialogTitle>
            {!simplified && <Divider />}
            <DialogContent className={classes.dialogContent}>{content}</DialogContent>
            <DialogActions
                className={classNames(classes.dialogActions, {
                    [classes.dialogActionsCenter]: actionsAlign === 'center',
                })}>
                {actions}
            </DialogActions>
        </>
    )
}

interface DialogRouterProps {
    path: string | RouteProps
    component?: React.ComponentType<any>
    children?: JSX.Element
    fullscreen?: boolean
    onExit?: string | (() => undefined)
}

export function DialogRouter(props: DialogRouterProps) {
    const { component: Component, children, path, fullscreen, onExit } = props
    const history = useHistory()
    const prevMatch = useRouteMatch()
    const matchPattern = useRouteMatch((prevMatch?.path ?? '/').replace(/\/$/, '') + path)
    const routeMatching = !!matchPattern
    const classes = useStyles()

    const onExitAction =
        typeof onExit === 'function'
            ? onExit
            : () => {
                  history.push(onExit || '../')
              }

    return (
        <Dialog
            closeAfterTransition
            onClose={onExitAction}
            fullScreen={fullscreen || false}
            open={routeMatching}
            classes={{ paper: classes.dialog }}
            TransitionComponent={Transition}>
            {fullscreen && (
                <Toolbar>
                    <Button
                        style={{ marginLeft: 'auto' }}
                        variant="text"
                        color="inherit"
                        onClick={onExitAction}
                        endIcon={<CloseIcon />}
                        aria-label="close">
                        Skip
                    </Button>
                </Toolbar>
            )}
            <Route path={matchPattern?.path}>
                {Component && <Component></Component>}
                {children || null}
            </Route>
        </Dialog>
    )
}
