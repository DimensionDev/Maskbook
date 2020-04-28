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
import CloseIcon from '@material-ui/icons/Close'
import type { TransitionProps } from '@material-ui/core/transitions'
import { useBlurContext } from '..'
import classNames from 'classnames'

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
    createStyles({
        wrapper: {
            width: '440px',
            padding: theme.spacing(4),
        },
        wrapperSizedSmall: {
            width: '280px',
            padding: theme.spacing(3),
        },
        header: {
            marginTop: theme.spacing(1),
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '280px',
        },
        primary: {
            margin: theme.spacing(1, 0),
        },
        secondary: {
            lineHeight: 1.75,
            textAlign: 'center',
        },
    }),
)

export function DashboardDialogWrapper(props: DashboardDialogWrapperProps) {
    const { icon, iconColor, primary, secondary, children, size } = props
    const classes = useDashboardDialogWrapperStyles()
    return (
        <DialogContent className={classNames(classes.wrapper, { [classes.wrapperSizedSmall]: size === 'small' })}>
            <section className={classes.header}>
                {React.cloneElement(icon, { width: 64, height: 64, stroke: iconColor })}
                <Typography className={classes.primary} variant="h5">
                    {primary}
                </Typography>
                <Typography className={classes.secondary} color="textSecondary" variant="body2">
                    {secondary}
                </Typography>
            </section>
            {children}
        </DialogContent>
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
