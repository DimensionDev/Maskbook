import React, { useState, useMemo, useCallback } from 'react'
import {
    DialogProps,
    useMediaQuery,
    Dialog,
    Slide,
    IconButton,
    createStyles,
    makeStyles,
    IconButtonProps,
    DialogContent,
    Typography,
} from '@material-ui/core'
import { Theme, ThemeProvider } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import type { TransitionProps } from '@material-ui/core/transitions'
import { useBlurContext } from '..'

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export function DashboardDialogCore(props: DialogProps) {
    const { fullScreen, ...dialogProps } = props

    const mobile = useMediaQuery('(max-width: 600px)')

    return (
        <Dialog
            closeAfterTransition
            fullScreen={fullScreen ?? mobile}
            TransitionComponent={Transition}
            hideBackdrop
            {...dialogProps}
        />
    )
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

const useStyles = makeStyles((theme) =>
    createStyles({
        close: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
        },
    }),
)

export interface DashboardDialogBaseProps extends Omit<DialogProps, 'open'> {
    CloseIconProps?: IconButtonProps
}

export function useDialog(
    _children: React.ReactNode,
    _props?: DashboardDialogBaseProps,
    _closeIconColor?: string,
): [React.ReactNode, () => void] {
    const [open, setOpen] = useState(false)
    useBlurContext(open)
    const classes = useStyles()
    const [[children, props, closeIconColor]] = useState<Parameters<typeof useDialog>>(() => [
        _children,
        _props,
        _closeIconColor,
    ])
    const close = useCallback(() => setOpen(false), [])
    const component = useMemo(
        () => (
            <DashboardDialogCore open={open} onClose={close} {...props}>
                {children}
                <IconButton onClick={close} className={classes.close} size="small" style={{ color: closeIconColor }}>
                    <CloseIcon />
                </IconButton>
            </DashboardDialogCore>
        ),
        [children, classes.close, close, closeIconColor, open, props],
    )
    return useMemo(() => [component, () => setOpen(true)], [component])
}
