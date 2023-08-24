import { memo, useCallback, useState } from 'react'
import { ActionButton } from '@masknet/theme'
import { Box } from '@mui/material'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { PasswordField } from '../../components/PasswordField/index.js'
import { UserContext } from '../../hooks/index.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { MATCH_PASSWORD_RE } from '../../constants.js'

export const VerifyBackupPasswordModal = memo<ActionModalBaseProps>(function VerifyBackupPasswordModal() {
    const { t } = useI18N()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [passwordMatched, setPasswordMatched] = useState(true)
    const [passwordValid, setPasswordValid] = useState(false)
    const { user } = UserContext.useContainer()

    const handleExport = useCallback(() => {
        if (user.backupPassword !== password) {
            setPasswordMatched(false)
            return
        }
        navigate(PopupRoutes.ExportPrivateKey, { replace: true })
    }, [user, password])

    return (
        <ActionModal
            header={t('popups_backup_persona')}
            action={
                <ActionButton onClick={handleExport} disabled={!passwordValid || !passwordMatched || !password.length}>
                    {t('export')}
                </ActionButton>
            }>
            <Box display="flex" flexDirection="column" m={0.5}>
                <PasswordField
                    placeholder={t('password')}
                    onFocus={() => setPasswordMatched(true)}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordValid(MATCH_PASSWORD_RE.test(e.target.value))
                    }}
                    onClear={() => {
                        setPasswordMatched(true)
                        setPassword('')
                    }}
                    value={password}
                    error={!passwordMatched}
                    helperText={
                        !passwordValid
                            ? t('popups_backup_password_invalid')
                            : !passwordMatched
                            ? t('popups_backup_password_incorrect')
                            : null
                    }
                />
            </Box>
        </ActionModal>
    )
})
