import { SendingCodeField, useCustomSnackbar } from '@masknet/theme'
import { Box } from '@mui/material'
import guessCallingCode from 'guess-calling-code'
import { pick } from 'lodash-es'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { useAsyncFn } from 'react-use'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { useLanguage } from '../../../../shared-ui/index.js'
import { sendCode, type RestoreQueryError } from '../../../utils/api.js'
import { phoneRegexp } from '../../../utils/regexp.js'
import { BackupAccountType } from '@masknet/shared-base'
import { Locale, Scenario } from '../../../utils/type.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { RestoreContext } from './RestoreProvider.js'
import { PhoneNumberField } from '@masknet/shared'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const PhoneField = memo(function PhoneField() {
    const { _ } = useLingui()
    const language = useLanguage()
    const [invalidPhone, setInvalidPhone] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const [error, setError] = useState('')
    const [codeError, setCodeError] = useState<ReactNode>()
    const { state, dispatch, downloadBackupInfo } = RestoreContext.useContainer()
    const { loading, phoneForm } = state
    const { account, code, dialingCode } = phoneForm
    const phoneConfig = useMemo(() => pick(phoneForm, 'dialingCode', 'phone'), [phoneForm])
    const onPhoneNumberChange = useCallback(
        (phoneNumber: string) => {
            dispatch({ type: 'SET_PHONE', form: { ...phoneConfig, phone: phoneNumber } })
        },
        [phoneConfig],
    )
    const onCountryCodeChange = useCallback(
        (code: string) => {
            dispatch({ type: 'SET_PHONE', form: { ...phoneConfig, dialingCode: code } })
        },
        [phoneConfig],
    )

    useEffect(() => {
        if (dialingCode) return
        dispatch({ type: 'SET_PHONE', form: { dialingCode: (guessCallingCode.default || guessCallingCode)() } })
    }, [!dialingCode])

    const validCheck = () => {
        if (!account) return
        const isValid = phoneRegexp.test(account)
        setInvalidPhone(!isValid)
    }
    const [{ error: sendCodeError }, handleSendCode] = useAsyncFn(async () => {
        const type = BackupAccountType.Phone
        showSnackbar(<Trans>Verification code has been sent to your phone.</Trans>, { variant: 'success' })
        await sendCode({
            account,
            type,
            scenario: Scenario.backup,
            locale: language.includes('zh') ? Locale.zh : Locale.en,
        })
    }, [account, language])

    const { fillSubmitOutlet } = usePersonaRecovery()
    const phoneNotReady = !account || invalidPhone || !phoneRegexp.test(account)
    const disabled = phoneNotReady || code.length !== 6 || !!error || loading
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                color="primary"
                size="large"
                onClick={async () => {
                    dispatch({ type: 'SET_LOADING', loading: true })
                    try {
                        const backupInfo = await downloadBackupInfo(BackupAccountType.Phone, account, code)
                        dispatch({ type: 'SET_BACKUP_INFO', info: backupInfo })
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
    }, [account, code, disabled, loading])

    return (
        <>
            <PhoneNumberField
                fullWidth
                code={phoneConfig.dialingCode}
                onCodeChange={onCountryCodeChange}
                onBlur={validCheck}
                onChange={(event) => onPhoneNumberChange(event.target.value)}
                error={invalidPhone}
                helperText={
                    invalidPhone ? <Trans>Invalid phone number, please check and try again.</Trans> : error || ''
                }
                value={phoneForm.phone}
            />
            <Box mt={1.5}>
                <SendingCodeField
                    fullWidth
                    value={code}
                    onChange={(code) => {
                        setCodeError('')
                        dispatch({ type: 'SET_PHONE', form: { code } })
                    }}
                    errorMessage={sendCodeError?.message || codeError}
                    onSend={handleSendCode}
                    placeholder={_(msg`Mobile verification code`)}
                    disabled={phoneNotReady}
                    inputProps={{
                        maxLength: 6,
                    }}
                />
            </Box>
        </>
    )
})
