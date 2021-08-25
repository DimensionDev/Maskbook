import { MaskDialog } from '@masknet/theme'
import type { PropsWithChildren, ReactNode } from 'react'
import { DialogContent, DialogActions, Button, styled, buttonClasses } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'

const StyledButton: typeof Button = styled(Button)(() => ({
    [`&.${buttonClasses.root}`]: {
        minWidth: 100,
    },
})) as any

export interface ConfirmDialogProps extends PropsWithChildren<{}> {
    title: string
    open: boolean
    cancelText?: ReactNode | string
    confirmText?: ReactNode | string
    confirmDisabled?: boolean
    maxWidth?: false | 'sm' | 'xs' | 'md' | 'lg' | 'xl'
    onClose(): void
    onConfirm?(): void
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
    const t = useDashboardI18N()
    const {
        title,
        open,
        onClose,
        onConfirm,
        children,
        maxWidth = 'sm',
        cancelText = t.settigns_button_cancel(),
        confirmText = t.settings_button_confirm(),
        confirmDisabled = false,
    } = props
    return (
        <MaskDialog title={title} fullWidth maxWidth={maxWidth} open={open} onClose={onClose}>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <StyledButton onClick={onClose} color="secondary">
                    {cancelText}
                </StyledButton>
                <StyledButton onClick={onConfirm} disabled={confirmDisabled}>
                    {confirmText}
                </StyledButton>
            </DialogActions>
        </MaskDialog>
    )
}
