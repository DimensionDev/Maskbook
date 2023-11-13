import { SendingCodeField, useCustomSnackbar } from '@masknet/theme'
import { Box, TextField } from '@mui/material'
import { memo, useCallback, useLayoutEffect, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { usePersonaRecovery } from '../../../contexts/RecoveryContext.js'
import { useDashboardTrans } from '../../../locales/index.js'
import { sendCode, type RestoreQueryError } from '../../../utils/api.js'
import { emailRegexp } from '../../../utils/regexp.js'
import { BackupAccountType } from '@masknet/shared-base'
import { Locale, Scenario } from '../../../utils/type.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { useLanguage } from '../../../../shared-ui/index.js'
import { RestoreContext } from './RestoreProvider.js'

export const EmailField = memo(function EmailField() {
    const language = useLanguage()
    const t = useDashboardTrans()
    const [invalidEmail, setInvalidEmail] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const [error, setError] = useState('')
    const [codeError, setCodeError] = useState('')

    const { state, dispatch, downloadBackupInfo } = RestoreContext.useContainer()
    const { emailForm, loading } = state
    const { account, code } = emailForm
    const setCode = useCallback((code: string) => {
        dispatch({ type: 'SET_EMAIL', form: { code } })
    }, [])

    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
        const type = BackupAccountType.Email
        await sendCode({
            account,
            type,
            scenario: Scenario.backup,
            locale: language.includes('zh') ? Locale.zh : Locale.en,
        })
        showSnackbar(t.sign_in_account_cloud_backup_send_email_success({ type }), { variant: 'success' })
    }, [account, language])

    const validCheck = () => {
        if (!account) return

        const isValid = emailRegexp.test(account)
        setInvalidEmail(!isValid)
    }

    const { fillSubmitOutlet } = usePersonaRecovery()
    const emailNotReady = !account || invalidEmail
    const disabled = emailNotReady || code.length !== 6
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                color="primary"
                size="large"
                onClick={async () => {
                    dispatch({ type: 'SET_LOADING', loading: true })
                    try {
                        const backupFileInfo = await downloadBackupInfo(BackupAccountType.Email, account, code)
                        dispatch({ type: 'SET_BACKUP_INFO', info: backupFileInfo })
                        dispatch({ type: 'NEXT_STEP' })
                    } catch (err) {
                        const message = (err as RestoreQueryError).message
                        if (['code not found', 'code mismatch'].includes(message))
                            setCodeError(t.incorrect_verification_code())
                        else setError(message)
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

    const hasError = sendCodeError?.message.includes('SendTemplatedEmail') || invalidEmail || !!error
    const errorMessage =
        sendCodeError?.message.includes('SendTemplatedEmail') || invalidEmail ?
            t.sign_in_account_cloud_backup_email_format_error()
        :   error || ''

    return (
        <>
            <TextField
                fullWidth
                value={account}
                autoFocus
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
                    fullWidth
                    value={code}
                    onChange={setCode}
                    errorMessage={
                        !sendCodeError?.message.includes('SendTemplatedEmail') ?
                            sendCodeError?.message || codeError
                        :   ''
                    }
                    onSend={handleSendCodeFn}
                    placeholder={t.data_recovery_email_code()}
                    disabled={emailNotReady}
                    inputProps={{
                        maxLength: 6,
                    }}
                />
            </Box>
        </>
    )
})
