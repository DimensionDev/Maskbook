import React, { useState, useMemo, useCallback, memo } from 'react'
import {
    DialogProps,
    useMediaQuery,
    Dialog,
    Fade,
    IconButton,
    createStyles,
    makeStyles,
    DialogContent,
    Typography,
} from '@material-ui/core'
import { Theme, ThemeProvider } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import type { TransitionProps } from '@material-ui/core/transitions'
import { useBlurContext } from '..'

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Fade ref={ref} {...props} />
})

const useStyles = makeStyles((theme) =>
    createStyles({
        close: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
        },
    }),
)

export interface DashboardDialogCoreProps extends DialogProps {
    closeIconColor?: string
}

export function DashboardDialogCore(props: DashboardDialogCoreProps) {
    const { fullScreen, children, closeIconColor, ...dialogProps } = props

    const mobile = useMediaQuery('(max-width: 600px)')
    const classes = useStyles()
    useBlurContext(dialogProps.open)

    return (
        <Dialog
            closeAfterTransition
            fullScreen={fullScreen ?? mobile}
            TransitionComponent={Transition}
            hideBackdrop
            {...dialogProps}>
            {children}
            <IconButton
                onClick={(e) => dialogProps.onClose?.(e, 'backdropClick')}
                className={classes.close}
                size="small"
                style={{ color: closeIconColor }}>
                <CloseIcon />
            </IconButton>
        </Dialog>
    )
}

export interface WrappedDialogProps<T extends object = any> extends DialogProps {
    ComponentProps?: T
}
type ShowModal = () => void
enum DialogState {
    Opened = 1,
    Closing,
    Destroyed,
}

export function useModal<T extends object>(
    component: React.FunctionComponent<WrappedDialogProps<T>>,
    ComponentProps?: T,
): [React.ReactNode, ShowModal] {
    const modal = useMemo(() => component, [component])
    const [state, setState] = useState<DialogState>(DialogState.Destroyed)
    const showModal = useCallback(() => setState(DialogState.Opened), [])
    const onClose = useCallback(() => setState(DialogState.Closing), [])
    const onExited = useCallback(() => setState(DialogState.Destroyed), [])

    const renderedComponent = modal({
        ...(ComponentProps ? { ComponentProps } : {}),
        open: state === DialogState.Opened,
        onClose,
        onExited,
    })

    return [state === DialogState.Destroyed ? null : renderedComponent, showModal]
}

interface DashboardDialogWrapperProps {
    icon: React.ReactElement
    iconColor?: string
    primary: string
    secondary?: string
    size?: 'small' | 'medium'
    children: React.ReactNode
}

const useDashboardDialogWrapperStyles = makeStyles((theme) =>
    createStyles<string, DashboardDialogWrapperProps>({
        wrapper: {
            width: (props) => (props.size === 'small' ? '350px' : '440px'),
            padding: (props) => theme.spacing(props.size === 'small' ? 3 : 4),
        },
        header: {
            marginTop: theme.spacing(1),
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '350px',
        },
        content: {
            marginTop: (props) => theme.spacing(props.size === 'small' ? 4 : 2),
            textAlign: 'center',
            '& > *:not(:last-child)': {
                marginBottom: theme.spacing(2),
            },
        },
        primary: {
            margin: theme.spacing(2, 0, 1),
        },
        secondary: {
            lineHeight: 1.75,
            textAlign: 'center',
        },
    }),
)

const dialogTheme = (theme: Theme): Theme => ({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiOutlinedInput: {
            notchedOutline: {
                borderColor: '#EAEAEA',
            },
        },
        MuiButton: {
            ...theme.overrides?.MuiButton,
            root: {
                ...theme.overrides?.MuiButton?.root,
                '&[hidden]': {
                    visibility: 'hidden',
                },
            },
        },
    },
    props: {
        ...theme.props,
        MuiButton: {
            ...theme.props?.MuiButton,
            size: 'medium',
        },
        MuiTextField: {
            fullWidth: true,
            variant: 'outlined',
            margin: 'normal',
        },
    },
})

export function DashboardDialogWrapper(props: DashboardDialogWrapperProps) {
    const { icon, iconColor, primary, secondary, children } = props
    const classes = useDashboardDialogWrapperStyles(props)
    return (
        <ThemeProvider theme={dialogTheme}>
            <DialogContent className={classes.wrapper}>
                <section className={classes.header}>
                    {React.cloneElement(icon, { width: 64, height: 64, stroke: iconColor })}
                    <Typography className={classes.primary} variant="h5">
                        {primary}
                    </Typography>
                    <Typography className={classes.secondary} color="textSecondary" variant="body2">
                        {secondary}
                    </Typography>
                </section>
                <section className={classes.content}>{children}</section>
            </DialogContent>
        </ThemeProvider>
    )
}
