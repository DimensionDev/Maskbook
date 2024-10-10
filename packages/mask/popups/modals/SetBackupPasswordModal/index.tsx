import { memo, useCallback, useMemo, useState, type ReactNode } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Typography, useTheme } from '@mui/material'
import { ActionButton, usePopupCustomSnackbar } from '@masknet/theme'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { UserContext } from '../../../shared-ui/index.js'
import { PasswordField } from '../../components/PasswordField/index.js'
import { MATCH_PASSWORD_RE } from '../../constants.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const SetBackupPasswordModal = memo<ActionModalBaseProps>(function SetBackupPasswordModal() {
    const { _ } = useLingui()
    const theme = useTheme()
    const [params] = useSearchParams()

    const to = params.get('to')

    const { updateUser } = UserContext.useContainer()
    const [newPassword, setNewPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [passwordValidError, setPasswordValidError] = useState<ReactNode>('')
    const [passwordMatched, setPasswordMatched] = useState(true)

    const navigate = useNavigate()

    const { showSnackbar } = usePopupCustomSnackbar()

    const validPassword = useCallback(() => {
        if (newPassword.length < 8 || newPassword.length > 20) {
            return
        } else if (!MATCH_PASSWORD_RE.test(newPassword)) {
            setPasswordValidError(<Trans>Lack of number, letter or special character.</Trans>)
            return
        }
        setPasswordValidError('')
    }, [newPassword])

    const validRepeatPassword = useCallback(() => {
        setPasswordMatched(newPassword === repeatPassword)
    }, [newPassword, repeatPassword])

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!newPassword || !passwordMatched || !!passwordValidError) return

        updateUser({
            backupPassword: newPassword,
        })

        showSnackbar(<Trans>Backup password set successfully</Trans>)

        if (to) {
            navigate(to, { replace: true })
            return
        }
        navigate(-1)
    }, [newPassword, passwordMatched, passwordValidError, updateUser, params, to])

    const disabled = useMemo(() => {
        if (!newPassword.length || !repeatPassword.length) return true
        if (newPassword.length < 8 || newPassword.length > 20) return true

        if (repeatPassword.length < 8 || repeatPassword.length > 20) return true

        if (!!passwordValidError || !passwordMatched) return true

        return false
    }, [newPassword, repeatPassword, passwordMatched, passwordValidError])

    return (
        <ActionModal
            header={<Trans>Backup Password</Trans>}
            action={
                <ActionButton onClick={handleClick} loading={loading} disabled={disabled}>
                    <Trans>Confirm</Trans>
                </ActionButton>
            }>
            <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center" rowGap={2} m={0.5}>
                <PasswordField
                    placeholder={_(msg`Password`)}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    onBlur={validPassword}
                    value={newPassword}
                    error={!!passwordValidError}
                    helperText={passwordValidError}
                />
                <PasswordField
                    placeholder={_(msg`Re-enter`)}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    value={repeatPassword}
                    onBlur={validRepeatPassword}
                    error={!passwordMatched}
                    helperText={!passwordMatched ? <Trans>Two entered passwords are not the same.</Trans> : ''}
                />
                <Box>
                    <Typography fontSize={12} color={theme.palette.maskColor.second}>
                        <Trans>
                            Backup password must be 8-20 characters, including uppercase, lowercase, special characters
                            and numbers.
                        </Trans>
                    </Typography>
                    {to ?
                        <Typography mt={2} fontSize={12} color={theme.palette.maskColor.second}>
                            <Trans>Please set up backup password to export private key.</Trans>
                        </Typography>
                    :   null}
                </Box>
            </Box>
        </ActionModal>
    )
})
