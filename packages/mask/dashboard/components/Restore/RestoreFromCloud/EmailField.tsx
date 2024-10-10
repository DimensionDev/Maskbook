import { SendingCodeField, useCustomSnackbar } from '@masknet/theme'
import { Box, TextField } from '@mui/material'
import { memo, useCallback, useLayoutEffect, useState, type ReactNode } from 'react'
import { useAsyncFn } from 'react-use'
import { usePersonaRecovery } from '../../../contexts/RecoveryContext.js'
import { sendCode, type RestoreQueryError } from '../../../utils/api.js'
import { emailRegexp } from '../../../utils/regexp.js'
import { BackupAccountType } from '@masknet/shared-base'
import { Locale, Scenario } from '../../../utils/type.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { useLanguage } from '../../../../shared-ui/index.js'
import { RestoreContext } from './RestoreProvider.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const EmailField = memo(function EmailField() {
    const { _ } = useLingui()
    const language = useLanguage()
    const [invalidEmail, setInvalidEmail] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const [error, setError] = useState('')
    const [codeError, setCodeError] = useState<ReactNode>(undefined)

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
        showSnackbar(<Trans>Verification code has been sent to your email. Please check your mailbox.</Trans>, {
            variant: 'success',
        })
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
                            setCodeError(<Trans>Invalid verification code.</Trans>)
                        else setError(message)
                    } finally {
                        dispatch({ type: 'SET_LOADING', loading: false })
                    }
                }}
                loading={loading}
                disabled={disabled}>
                <Trans>Continue</Trans>
            </PrimaryButton>,
        )
    }, [account, code, loading, disabled])

    const hasError = sendCodeError?.message.includes('SendTemplatedEmail') || invalidEmail || !!error
    const errorMessage =
        sendCodeError?.message.includes('SendTemplatedEmail') || invalidEmail ?
            <Trans>Invalid email address.</Trans>
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
                placeholder={_(msg`Email`)}
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
                    placeholder={_(msg`Email verification code`)}
                    disabled={emailNotReady}
                    inputProps={{
                        maxLength: 6,
                    }}
                />
            </Box>
        </>
    )
})
