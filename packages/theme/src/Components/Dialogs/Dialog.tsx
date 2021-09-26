import { Dialog, DialogActions, DialogContent, DialogProps } from '@mui/material'
import { memo, ReactNode, useCallback, useState } from 'react'
import { usePortalShadowRoot } from '../../ShadowRoot'
import { MaskDialogTitle, MaskDialogTitleProps } from './DialogTitle'
import { useDialogStackConsumer } from './DialogStack'
export interface MaskDialogProps
    extends React.PropsWithChildren<Omit<MaskDialogTitleProps, 'children'>>,
        Pick<DialogProps, 'fullWidth' | 'maxWidth'> {
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
    const { title, onBack, onClose, open, children, DialogProps, ...inferredDialogProps } = props
    const dialogProps: DialogProps = { onBackdropClick: onClose, onClose, open, ...inferredDialogProps, ...DialogProps }
    const { extraProps, shouldReplaceExitWithBack } = useDialogStackConsumer(open)
    return usePortalShadowRoot((container) => (
        <Dialog container={container} {...dialogProps} {...extraProps}>
            {shouldReplaceExitWithBack ? (
                // replace onClose with onBack when and only when there is no onBack
                <MaskDialogTitle onBack={onBack || onClose} onClose={onBack ? onClose : undefined} children={title} />
            ) : (
                <MaskDialogTitle onBack={onBack} onClose={onClose} children={title} />
            )}
            {children}
        </Dialog>
    ))
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
