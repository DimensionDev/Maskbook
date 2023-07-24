import { memo, useCallback, useState } from 'react'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ActionButton, usePopupCustomSnackbar } from '@masknet/theme'
import { PasswordField } from '../../components/PasswordField/index.js'
import { UserContext } from '../../hook/useUserContext.js'
import { passwordRegexp } from '../../regexp.js'
import { useAsyncFn } from 'react-use'
import { PopupRoutes } from '@masknet/shared-base'

export const SetBackupPasswordModal = memo<ActionModalBaseProps>(function SetBackupPasswordModal() {
    const { t } = useI18N()
    const theme = useTheme()
    const { updateUser } = UserContext.useContainer()
    const [newPassword, setNewPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [passwordValid, setValidState] = useState(true)
    const [passwordMatched, setPasswordMatched] = useState(true)
    const navigate = useNavigate()

    const { showSnackbar } = usePopupCustomSnackbar()

    const validPassword = useCallback(() => {
        const isValid = passwordRegexp.test(newPassword)
        setValidState(isValid)
    }, [newPassword])

    const validRepeatPassword = useCallback(() => {
        setPasswordMatched(newPassword === repeatPassword)
    }, [newPassword, repeatPassword])

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!newPassword || !passwordMatched || !passwordValid) return

        updateUser({
            backupPassword: newPassword,
        })

        showSnackbar(t('popups_backup_password_set_successfully'))

        navigate(PopupRoutes.ExportPrivateKey, { replace: true })
    }, [newPassword, passwordMatched, passwordValid, updateUser])

    return (
        <ActionModal
            header={t('popups_backup_password')}
            action={
                <ActionButton
                    onClick={handleClick}
                    loading={loading}
                    disabled={!passwordMatched || !passwordValid || !newPassword.length || !repeatPassword.length}>
                    {t('confirm')}
                </ActionButton>
            }>
            <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center" rowGap={2} m={0.5}>
                <PasswordField
                    placeholder={t('password')}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={validPassword}
                    value={newPassword}
                    error={!passwordValid}
                    helperText={!passwordValid ? t('popups_backup_password_rules') : ''}
                />
                <PasswordField
                    placeholder={t('reenter')}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    value={repeatPassword}
                    onBlur={validRepeatPassword}
                    error={!passwordMatched}
                    helperText={!passwordMatched ? t('popups_backup_password_inconsistency') : ''}
                />
                <Box>
                    <Typography fontSize={12} color={theme.palette.maskColor.second}>
                        {t('popups_backup_password_rules')}
                    </Typography>
                    <Typography mt={2} fontSize={12} color={theme.palette.maskColor.second}>
                        {t('popups_backup_password_tips')}
                    </Typography>
                </Box>
            </Box>
        </ActionModal>
    )
})
