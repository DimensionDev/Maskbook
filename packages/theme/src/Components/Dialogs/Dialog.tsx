import { Dialog, DialogActions, DialogContent, DialogProps } from '@mui/material'
import { memo, ReactNode, useCallback, useState } from 'react'
import { usePortalShadowRoot } from '../../ShadowRoot'
import { MaskDialogTitle, MaskDialogTitleProps } from './DialogTitle'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useDialogStackActor } from './DialogStack'
export interface MaskDialogProps
    extends React.PropsWithChildren<Omit<MaskDialogTitleProps, 'children'>>,
        Pick<DialogProps, 'fullWidth' | 'maxWidth'> {
    title: string
    open: boolean
    DialogProps?: Omit<DialogProps, 'open'>
    isOpenFromApplicationBoard?: boolean
}

/**
 * This component is used to provide a most common dialog practice in Mask design.
 *
 * But all the primitives are tweaked to fit the design
 * Therefore it also OK to not use this component if you need a special one.
 */
export const MaskDialog = memo((props: MaskDialogProps) => {
    const { title, onBack, onClose, open, children, DialogProps, isOpenFromApplicationBoard, ...inferredDialogProps } =
        props
    const dialogProps: DialogProps = { onBackdropClick: onClose, onClose, open, ...inferredDialogProps, ...DialogProps }
    const { extraProps, shouldReplaceExitWithBack, IncreaseStack } = useDialogStackActor(open)
    const closeBothCompositionDialog = useCallback(() => {
        if (isOpenFromApplicationBoard) {
            CrossIsolationMessages.events.requestComposition.sendToLocal({ open: false, reason: 'timeline' })
        }

        onClose?.()
    }, [isOpenFromApplicationBoard])
    return usePortalShadowRoot((container) => (
        <IncreaseStack>
            <Dialog container={container} {...dialogProps} {...extraProps}>
                {shouldReplaceExitWithBack ? (
                    // replace onClose with onBack when and only when there is no onBack
                    <MaskDialogTitle
                        onBack={onBack || closeBothCompositionDialog}
                        onClose={onBack ? closeBothCompositionDialog : undefined}
                        children={title}
                    />
                ) : (
                    <MaskDialogTitle onBack={onBack} onClose={closeBothCompositionDialog} children={title} />
                )}
                {children}
            </Dialog>
        </IncreaseStack>
    ))
})

export function useMaskDialog(title: string, content: ReactNode, actions: ReactNode) {
    const [isOpen, setOpen] = useState(false)
    const onClose = useCallback(() => setOpen(false), [])
    return (
        <MaskDialog onClose={onClose} open={isOpen} title={title}>
            <DialogContent>{content}</DialogContent>
            <DialogActions>{actions}</DialogActions>
        </MaskDialog>
    )
}
