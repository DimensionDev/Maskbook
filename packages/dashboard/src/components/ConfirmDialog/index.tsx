import { MaskDialog } from '@dimensiondev/maskbook-theme'
import {
    DialogContent,
    DialogActions,
    Button,
    dialogActionsClasses,
    dialogContentClasses,
    experimentalStyled as styled,
    buttonClasses,
} from '@material-ui/core'

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    [`&.${dialogActionsClasses.root}>:not(:first-of-type)`]: {
        marginLeft: theme.spacing(3),
    },
}))

const StyledDialogContent = styled(DialogContent)(() => ({
    [`&.${dialogContentClasses.root}`]: {
        paddingLeft: 90,
        paddingRight: 90,
        minHeight: 168,
        display: 'flex',
        alignItems: 'center',
    },
}))

const StyledButton: typeof Button = styled(Button)(() => ({
    [`&.${buttonClasses.root}`]: {
        minWidth: 100,
    },
})) as any

interface ConfirmDialogProps extends React.PropsWithChildren<{}> {
    title: string
    open: boolean
    cancelText?: React.ReactNode | string
    confirmText?: React.ReactNode | string
    confirmDisabled?: boolean
    onClose(): void
    onConfirm(): void
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
    const {
        title,
        open,
        onClose,
        onConfirm,
        children,
        cancelText = 'Cancel',
        confirmText = 'Confirm',
        confirmDisabled = false,
    } = props
    return (
        <MaskDialog title={title} fullWidth maxWidth="sm" open={open} onClose={onClose}>
            <StyledDialogContent>{children}</StyledDialogContent>
            <StyledDialogActions>
                <StyledButton onClick={onClose} color="secondary">
                    {cancelText}
                </StyledButton>
                <StyledButton onClick={onConfirm} disabled={confirmDisabled}>
                    {confirmText}
                </StyledButton>
            </StyledDialogActions>
        </MaskDialog>
    )
}
