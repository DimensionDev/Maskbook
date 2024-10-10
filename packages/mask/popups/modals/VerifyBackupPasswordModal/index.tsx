import { memo, useCallback, useState } from 'react'
import { ActionButton } from '@masknet/theme'
import { Box } from '@mui/material'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { UserContext } from '../../../shared-ui/index.js'
import { PasswordField } from '../../components/PasswordField/index.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { MATCH_PASSWORD_RE } from '../../constants.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const VerifyBackupPasswordModal = memo<ActionModalBaseProps>(function VerifyBackupPasswordModal() {
    const { _ } = useLingui()
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
            <Box display="flex" flexDirection="column" m={0.5}>
                <PasswordField
                    placeholder={_(msg`Password`)}
                    onFocus={() => setPasswordMatched(true)}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordValid(MATCH_PASSWORD_RE.test(e.target.value))
                    }}
                    value={password}
                    error={!passwordMatched}
                    helperText={
                        !passwordValid ? <Trans>Please enter backup password to export persona private key.</Trans>
                        : !passwordMatched ?
                            <Trans>Incorrect backup password.</Trans>
                        :   null
                    }
                />
            </Box>
        </ActionModal>
    )
})
