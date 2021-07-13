import { MaskDialog } from '@masknet/theme'
import {
    Button,
    buttonClasses,
    DialogContent,
    Typography,
    experimentalStyled as styled,
    DialogActions,
} from '@material-ui/core'
import { UserContext } from '../../hooks/UserContext'
import { useContext } from 'react'

const StyledButton: typeof Button = styled(Button)(() => ({
    [`&.${buttonClasses.root}`]: {
        minWidth: 100,
    },
})) as any

export interface LogoutDialogProps {
    open: boolean
    onClose(): void
}

export default function LogoutDialog({ open, onClose }: LogoutDialogProps) {
    const { updateUser } = useContext(UserContext)
    const onConfirm = () => {
        updateUser({ backupPassword: null, email: null, phone: null })
        onClose()
    }
    return (
        <MaskDialog title="Log out" maxWidth="xs" open={open} onClose={onClose}>
            <DialogContent sx={{ padding: '16px 44px 64px' }}>
                <Typography sx={{ fontSize: '14px' }}>
                    The data of Mask Network is stored in your current browser. Please don’t delete Mask Network plugin
                    randomly. Remember to back up your current data of Mask Network plugin in time before you log out.
                </Typography>
            </DialogContent>
            <DialogActions>
                <StyledButton onClick={onClose} color="secondary">
                    Cancel
                </StyledButton>
                <StyledButton onClick={onConfirm} color="error">
                    Log out
                </StyledButton>
            </DialogActions>
        </MaskDialog>
    )
}
