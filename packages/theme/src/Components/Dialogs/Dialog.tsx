import { Dialog, DialogActions, DialogContent, DialogProps } from '@material-ui/core'
import { memo, ReactNode, useCallback, useState } from 'react'
import { MaskDialogTitle, MaskDialogTitleProps } from './DialogTitle'
export interface MaskDialogProps extends React.PropsWithChildren<Omit<MaskDialogTitleProps, 'children'>> {
    title: string
    open: boolean
    DialogProps?: Omit<DialogProps, 'open'>
}

/**
 * This component is used to provide a most common dialog practice in Mask design.
 *
 * But all the primitives are tweaked to fit the design
 * Therefore it also OK to not use this component if you need a special one.
 */
export const MaskDialog = memo((props: MaskDialogProps) => {
    const { title, onBack, onClose, open, children, DialogProps } = props
    return (
        <Dialog onBackdropClick={onClose} onClose={onClose} open={open} {...DialogProps}>
            <MaskDialogTitle onBack={onBack} onClose={onClose}>
                {title}
            </MaskDialogTitle>
            {children}
        </Dialog>
    )
})

export function useMaskDialog(title: string, content: ReactNode, actions: ReactNode) {
    const [isOpen, open] = useState(false)
    const onClose = useCallback(() => open(false), [])
    return (
        <MaskDialog onClose={onClose} open={isOpen} title={title}>
            <DialogContent>{content}</DialogContent>
            <DialogActions>{actions}</DialogActions>
        </MaskDialog>
    )
}
