import { Trans, useLingui } from '@lingui/react/macro'
import { PopupRoutes } from '@masknet/shared-base'
import { ActionButton } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../shared-ui/index.js'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { PasswordField } from '@masknet/injected-ui/PasswordField'
import { MATCH_PASSWORD_RE } from '../../constants.js'

export const VerifyBackupPasswordModal = memo<ActionModalBaseProps>(function VerifyBackupPasswordModal() {
    const { t } = useLingui()
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
            header={<Trans>Backup Persona</Trans>}
            action={
                <ActionButton onClick={handleExport} disabled={!passwordValid || !passwordMatched || !password.length}>
                    <Trans>Export</Trans>
                </ActionButton>
            }>
            <Box sx={{ display: 'flex', flexDirection: 'column', m: 0.5 }}>
                <PasswordField
                    placeholder={t`Password`}
                    onFocus={() => setPasswordMatched(true)}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordValid(MATCH_PASSWORD_RE.test(e.target.value))
                    }}
                    value={password}
                    error={!passwordMatched}
                    helperText={
                        passwordValid ?
                            passwordMatched ?
                                null
                            :   <Trans>Incorrect backup password.</Trans>
                        :   <Trans>Please enter backup password to export persona private key.</Trans>
                    }
                />
            </Box>
        </ActionModal>
    )
})
