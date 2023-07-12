import {
    PhoneNumberField,
    SendingCodeField,
    useCustomSnackbar,
    type PhoneNumberFieldValue as PhoneConfig,
} from '@masknet/theme'
import { Box } from '@mui/material'
import guessCallingCode from 'guess-calling-code'
import { pick } from 'lodash-es'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { useLanguage } from '../../../pages/Personas/api.js'
import { sendCode, type RestoreQueryError } from '../../../pages/Settings/api.js'
import { phoneRegexp } from '../../../pages/Settings/regexp.js'
import { AccountType, Locale, Scenario } from '../../../pages/Settings/type.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { RestoreContext } from './RestoreProvider.js'

export const PhoneField = memo(function PhoneField() {
    const language = useLanguage()
    const t = useDashboardI18N()
    const [invalidPhone, setInvalidPhone] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const [error, setError] = useState('')
    const { state, dispatch, downloadBackupInfo } = RestoreContext.useContainer()
    const { loading, phoneForm } = state
    const { account, code, dialingCode } = phoneForm
    const phoneConfig: PhoneConfig = useMemo(() => pick(phoneForm, 'dialingCode', 'phone', 'country'), [phoneForm])
    const setPhoneConfig = useCallback((newConfig: PhoneConfig) => dispatch({ type: 'SET_PHONE', form: newConfig }), [])
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
    const disabled = !account || invalidPhone || !phoneRegexp.test(account) || !code || !!error || loading
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
    }, [account, code, disabled, loading])

    return (
        <>
            <PhoneNumberField
                onBlur={validCheck}
                onChange={setPhoneConfig}
                error={invalidPhone ? t.data_recovery_invalid_mobile() : error || ''}
                value={phoneConfig}
                placeholder={t.mobile_number()}
            />
            <Box mt={1.5}>
                <SendingCodeField
                    onChange={(code) => dispatch({ type: 'SET_PHONE', form: { code } })}
                    errorMessage={sendCodeError?.message}
                    onSend={handleSendCode}
                    placeholder={t.data_recovery_mobile_code()}
                    inputProps={{
                        maxLength: 6,
                    }}
                />
            </Box>
        </>
    )
})
