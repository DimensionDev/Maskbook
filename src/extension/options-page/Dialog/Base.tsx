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
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { TransitionProps } from '@material-ui/core/transitions'
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

const useStyles = makeStyles(theme =>
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
