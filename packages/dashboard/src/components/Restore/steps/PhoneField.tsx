import {
    PhoneNumberField,
    SendingCodeField,
    useCustomSnackbar,
    type PhoneNumberFieldValue as PhoneConfig,
} from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useLayoutEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import guessCallingCode from 'guess-calling-code'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { useLanguage } from '../../../pages/Personas/api.js'
import { sendCode } from '../../../pages/Settings/api.js'
import { phoneRegexp } from '../../../pages/Settings/regexp.js'
import { AccountType, Locale, Scenario, type BackupFileInfo } from '../../../pages/Settings/type.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import type { StepCommonProps } from '../../Stepper/index.js'
import { ValidationCodeStep } from './common.js'

interface Props extends StepCommonProps {
    onNext(
        account: string,
        type: AccountType,
        code: string,
    ): Promise<
        | BackupFileInfo
        | {
              message: string
          }
    >
}

export const PhoneField = memo(function PhoneField({ toStep, onNext }: Props) {
    const language = useLanguage()
    const t = useDashboardI18N()
    const [invalidPhone, setInvalidPhone] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const [otp, setOTP] = useState('')
    const [error, setError] = useState('')

    const [phoneConfig, setPhoneConfig] = useState<PhoneConfig>({ phone: '' })
    const account = useMemo(() => {
        const code = phoneConfig.dialingCode || guessCallingCode()
        return `+${code} ${phoneConfig.phone}`
    }, [phoneConfig.dialingCode, phoneConfig.phone])

    const validCheck = () => {
        if (!account) return
        const isValid = phoneRegexp.test(account)
        setInvalidPhone(!isValid)
    }
    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
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
    const disabled = !account || invalidPhone || !phoneRegexp.test(account) || !otp || !!error
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                color="primary"
                size="large"
                onClick={async () => {
                    const backupInfo = await onNext(account, AccountType.Phone, otp)
                    if ('downloadURL' in backupInfo) {
                        toStep(ValidationCodeStep.ConfirmBackupInfo, { backupInfo, account, type: AccountType.Phone })
                    } else {
                        setError(backupInfo.message)
                    }
                }}
                disabled={disabled}>
                {t.continue()}
            </PrimaryButton>,
        )
    }, [account, otp, disabled])

    return (
        <>
            <PhoneNumberField
                onBlur={validCheck}
                onChange={(newConfig) => setPhoneConfig(newConfig)}
                error={invalidPhone ? t.sign_in_account_cloud_backup_phone_format_error() : error || ''}
                value={phoneConfig}
                placeholder={t.mobile_number()}
            />
            <Box mt={1.5}>
                <SendingCodeField
                    onChange={(c) => setOTP(c)}
                    errorMessage={sendCodeError?.message}
                    onSend={handleSendCodeFn}
                    placeholder={t.data_recovery_mobile_code()}
                />
            </Box>
        </>
    )
})
