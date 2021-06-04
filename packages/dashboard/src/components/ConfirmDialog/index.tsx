import { MaskDialog, MaskColorVar } from '@dimensiondev/maskbook-theme'
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    dialogActionsClasses,
    dialogContentClasses,
    experimentalStyled as styled,
    buttonClasses,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

export interface DialogTitleProps {
    children?: React.ReactNode
    onClose: () => void
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
    const { children, onClose, ...other } = props

    return (
        <DialogTitle disableTypography {...other}>
            <Typography variant="h6" component="div">
                {children}
            </Typography>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: MaskColorVar.textPrimary,
                }}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
    )
}

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

const StyledButton = styled(Button)(() => ({
    [`&.${buttonClasses.root}`]: {
        minWidth: 100,
    },
}))

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
