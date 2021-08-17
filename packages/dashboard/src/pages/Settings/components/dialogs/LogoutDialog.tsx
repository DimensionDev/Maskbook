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
import { useDashboardI18N } from '../../../../locales'

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
    const t = useDashboardI18N()
    const { updateUser } = useContext(UserContext)
    const onConfirm = () => {
        updateUser({ backupPassword: null, email: null, phone: null })
        onClose()
    }
    return (
        <MaskDialog title={t.settings_log_out_title()} maxWidth="xs" open={open} onClose={onClose}>
            <DialogContent sx={{ padding: '16px 44px 64px' }}>
                <Typography sx={{ fontSize: '14px' }}>{t.settings_log_out_tips()}</Typography>
            </DialogContent>
            <DialogActions>
                <StyledButton onClick={onClose} color="secondary">
                    Cancel
                </StyledButton>
                <StyledButton onClick={onConfirm} color="error">
                    {t.settings_log_out_title()}
                </StyledButton>
            </DialogActions>
        </MaskDialog>
    )
}
