import { SendingCodeField, useCustomSnackbar } from '@masknet/theme'
import { Box } from '@mui/material'
import guessCallingCode from 'guess-calling-code'
import { pick } from 'lodash-es'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { useLanguage } from '../../../../shared-ui/index.js'
import { sendCode, type RestoreQueryError } from '../../../utils/api.js'
import { phoneRegexp } from '../../../utils/regexp.js'
import { AccountType, Locale, Scenario } from '../../../type.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { RestoreContext } from './RestoreProvider.js'
import { PhoneNumberField } from '@masknet/shared'

export const PhoneField = memo(function PhoneField() {
    const language = useLanguage()
    const t = useDashboardI18N()
    const [invalidPhone, setInvalidPhone] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const [error, setError] = useState('')
    const [codeError, setCodeError] = useState('')
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
        dispatch({ type: 'SET_PHONE', form: { dialingCode: guessCallingCode() } })
    }, [!dialingCode])

    const validCheck = () => {
        if (!account) return
        const isValid = phoneRegexp.test(account)
        setInvalidPhone(!isValid)
    }
    const [{ error: sendCodeError }, handleSendCode] = useAsyncFn(async () => {
        const type = AccountType.Phone
        showSnackbar(t.sign_in_account_cloud_backup_send_email_success({ type }), { variant: 'success' })
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
                        const backupInfo = await downloadBackupInfo(AccountType.Phone, account, code)
                        dispatch({ type: 'SET_BACKUP_INFO', info: backupInfo })
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
                helperText={invalidPhone ? t.data_recovery_invalid_mobile() : error || ''}
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
                    placeholder={t.data_recovery_mobile_code()}
                    disabled={phoneNotReady}
                    inputProps={{
                        maxLength: 6,
                    }}
                />
            </Box>
        </>
    )
})
