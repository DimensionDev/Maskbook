import { MaskTextField, SendingCodeField, useCustomSnackbar } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useLayoutEffect, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { usePersonaRecovery } from '../../../contexts/RecoveryContext.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { sendCode } from '../../../pages/Settings/api.js'
import { emailRegexp } from '../../../pages/Settings/regexp.js'
import { AccountType, Locale, Scenario, type BackupFileInfo } from '../../../pages/Settings/type.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { ValidationCodeStep } from './common.js'
import { useLanguage } from '../../../pages/Personas/api.js'
import type { StepCommonProps } from '../../Stepper/index.js'

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

export const EmailField = memo(function EmailField({ toStep, onNext }: Props) {
    const language = useLanguage()
    const t = useDashboardI18N()
    const [account, setAccount] = useState<string>('')
    const [invalidEmail, setInvalidEmail] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const [code, setCode] = useState('')

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
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                color="primary"
                size="large"
                onClick={async () => {
                    const backupInfo = await onNext(account, AccountType.Email, code)
                    toStep(ValidationCodeStep.ConfirmBackupInfo, { backupInfo, account, type: AccountType.Email })
                }}
                disabled={!account || invalidEmail}>
                {t.continue()}
            </PrimaryButton>,
        )
    }, [account, code, invalidEmail])

    return (
        <>
            <MaskTextField
                fullWidth
                value={account}
                onBlur={validCheck}
                onChange={(event) => setAccount(event.target.value)}
                error={invalidEmail}
                placeholder={t.data_recovery_email()}
                helperText={invalidEmail ? t.sign_in_account_cloud_backup_email_format_error() : ''}
                type="email"
                size="small"
            />
            <Box mt={1.5}>
                <SendingCodeField
                    onChange={(c) => setCode(c)}
                    errorMessage={sendCodeError?.message}
                    onSend={handleSendCodeFn}
                    placeholder={t.data_recovery_email_code()}
                />
            </Box>
        </>
    )
})
