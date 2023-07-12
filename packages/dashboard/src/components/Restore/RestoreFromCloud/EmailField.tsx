import { MaskTextField, SendingCodeField, useCustomSnackbar } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useCallback, useLayoutEffect, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { usePersonaRecovery } from '../../../contexts/RecoveryContext.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { sendCode, type RestoreQueryError } from '../../../pages/Settings/api.js'
import { emailRegexp } from '../../../pages/Settings/regexp.js'
import { AccountType, Locale, Scenario } from '../../../pages/Settings/type.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { useLanguage } from '../../../pages/Personas/api.js'
import { RestoreContext } from './RestoreProvider.js'

export const EmailField = memo(function EmailField() {
    const language = useLanguage()
    const t = useDashboardI18N()
    const [invalidEmail, setInvalidEmail] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const [error, setError] = useState('')

    const { state, dispatch, downloadBackupInfo } = RestoreContext.useContainer()
    const { emailForm, loading } = state
    const { account, code } = emailForm
    const setCode = useCallback((code: string) => {
        dispatch({ type: 'SET_EMAIL', form: { code } })
    }, [])

    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
        const type = AccountType.Email
        showSnackbar(t.sign_in_account_cloud_backup_send_email_success({ type }), { variant: 'success' })
        await sendCode({
            account,
            type,
            scenario: Scenario.backup,
            locale: language.includes('zh') ? Locale.zh : Locale.en,
        })
    }, [account, language])

    const validCheck = () => {
        if (!account) return

        const isValid = emailRegexp.test(account)
        setInvalidEmail(!isValid)
    }

    const { fillSubmitOutlet } = usePersonaRecovery()
    const disabled = !account || invalidEmail || !code
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                color="primary"
                size="large"
                onClick={async () => {
                    dispatch({ type: 'SET_LOADING', loading: true })
                    try {
                        const backupFileInfo = await downloadBackupInfo(AccountType.Email, account, code)
                        dispatch({ type: 'SET_BACKUP_INFO', info: backupFileInfo })
                        dispatch({ type: 'NEXT_STEP' })
                    } catch (err) {
                        setError((err as RestoreQueryError).message)
                    } finally {
                        dispatch({ type: 'SET_LOADING', loading: false })
                    }
                }}
                loading={loading}
                disabled={disabled}>
                {t.continue()}
            </PrimaryButton>,
        )
    }, [account, code, loading, disabled])

    const hasError = invalidEmail || !!error
    const errorMessage = invalidEmail ? t.sign_in_account_cloud_backup_email_format_error() : error || ''

    return (
        <>
            <MaskTextField
                fullWidth
                value={account}
                onBlur={validCheck}
                onChange={(event) => {
                    setError('')
                    dispatch({
                        type: 'SET_EMAIL',
                        form: { account: event.target.value },
                    })
                }}
                error={hasError}
                placeholder={t.data_recovery_email()}
                helperText={errorMessage}
                type="email"
                size="small"
            />
            <Box mt={1.5}>
                <SendingCodeField
                    onChange={setCode}
                    errorMessage={sendCodeError?.message}
                    onSend={handleSendCodeFn}
                    placeholder={t.data_recovery_email_code()}
                    inputProps={{
                        maxLength: 6,
                    }}
                />
            </Box>
        </>
    )
})
