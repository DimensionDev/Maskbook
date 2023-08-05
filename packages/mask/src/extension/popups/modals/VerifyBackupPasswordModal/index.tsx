import { memo, useCallback, useState } from 'react'
import { ActionButton } from '@masknet/theme'
import { Box } from '@mui/material'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { PasswordField } from '../../components/PasswordField/index.js'
import { UserContext } from '../../hook/useUserContext.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'

export const VerifyBackupPasswordModal = memo<ActionModalBaseProps>(function VerifyBackupPasswordModal() {
    const { t } = useI18N()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [passwordMatched, setPasswordMatched] = useState(true)
    const { user } = UserContext.useContainer()

    const verifyPassword = useCallback(() => {
        setPasswordMatched(user.backupPassword === password)
    }, [user, password])

    const handleExport = useCallback(() => {
        navigate(PopupRoutes.ExportPrivateKey, { replace: true })
    }, [])

    return (
        <ActionModal
            header={t('popups_backup_persona')}
            action={
                <ActionButton onClick={handleExport} disabled={!passwordMatched || !password.length}>
                    {t('export')}
                </ActionButton>
            }>
            <Box display="flex" flexDirection="column" m={0.5}>
                <PasswordField
                    placeholder={t('password')}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={verifyPassword}
                    error={!passwordMatched}
                    helperText={!passwordMatched ? t('popups_backup_password_inconsistency') : null}
                />
            </Box>
        </ActionModal>
    )
})
