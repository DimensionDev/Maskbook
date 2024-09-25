import { Dialog, DialogActions, DialogContent, type DialogProps } from '@mui/material'
import { memo, type ReactNode, useCallback, useState } from 'react'
import { usePortalShadowRoot } from '../../ShadowRoot/index.js'
import { MaskDialogTitle, type MaskDialogTitleProps } from './DialogTitle.js'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useDialogStackActor } from './DialogStack.js'
export interface MaskDialogProps
    extends React.PropsWithChildren<Omit<MaskDialogTitleProps, 'children'>>,
        Pick<DialogProps, 'fullWidth' | 'maxWidth'> {
    title: ReactNode
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
    const { extraProps, shouldReplaceExitWithBack, TrackDialogHierarchy } = useDialogStackActor(open)
    const closeBothCompositionDialog = useCallback(() => {
        if (isOpenFromApplicationBoard) {
            CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
                open: false,
                reason: 'popup',
                options: { isOpenFromApplicationBoard },
            })
            CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
                open: false,
                reason: 'timeline',
                options: { isOpenFromApplicationBoard },
            })
        }

        onClose?.()
    }, [isOpenFromApplicationBoard])
    return usePortalShadowRoot((container) => (
        <TrackDialogHierarchy>
            <Dialog container={container} {...dialogProps} {...extraProps}>
                {shouldReplaceExitWithBack ?
                    // replace onClose with onBack when and only when there is no onBack
                    <MaskDialogTitle
                        onBack={onBack || closeBothCompositionDialog}
                        onClose={onBack ? closeBothCompositionDialog : undefined}
                        children={title}
                    />
                :   <MaskDialogTitle onBack={onBack} onClose={closeBothCompositionDialog} children={title} />}
                {children}
            </Dialog>
        </TrackDialogHierarchy>
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
