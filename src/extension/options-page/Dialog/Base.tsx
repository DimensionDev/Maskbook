import React, { useState, useMemo } from 'react'
import { DialogProps, useMediaQuery, Dialog, Slide } from '@material-ui/core'
import { TransitionProps } from '@material-ui/core/transitions'
import { useBlurContext } from '..'

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

interface DashboardDialogBaseProps extends DialogProps {}

export function DashboardDialogBase(props: DashboardDialogBaseProps) {
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

export function useDialog(
    _children: React.ReactNode,
    _props?: DashboardDialogBaseProps,
): [React.ReactNode, () => void] {
    const [open, setOpen] = useState(false)
    useBlurContext(open)
    const [[children, props]] = useState(() => [_children, _props])
    const component = useMemo(
        () => (
            <DashboardDialogBase open={open} onClose={() => setOpen(false)} {...props}>
                {children}
            </DashboardDialogBase>
        ),
        [children, open, props],
    )
    return useMemo(() => [component, () => setOpen(true)], [component])
}
