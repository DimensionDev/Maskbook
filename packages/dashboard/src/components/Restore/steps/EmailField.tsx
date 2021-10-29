import { useDashboardI18N } from '../../../locales'
import { memo, useState } from 'react'
import { MaskTextField } from '@masknet/theme'
import { ButtonContainer } from '../../RegisterFrame/ButtonContainer'
import { Button } from '@mui/material'
import { Label, ValidationCodeStep } from './common'
import type { StepCommonProps } from '../../Stepper'
import { AccountType } from '../../../pages/Settings/type'
import { emailRegexp } from '../../../pages/Settings/regexp'

export const EmailField = memo(({ toStep }: StepCommonProps) => {
    const t = useDashboardI18N()
    const [account, setAccount] = useState<string>('')
    const [invalidEmail, setInvalidEmail] = useState(false)

    const validCheck = () => {
        if (!account) return

        const isValid = emailRegexp.test(account)
        setInvalidEmail(!isValid)
    }

    return (
        <>
            <MaskTextField
                label={<Label onModeChange={() => toStep(ValidationCodeStep.PhoneInput)} mode={AccountType.email} />}
                fullWidth
                value={account}
                onBlur={validCheck}
                onChange={(event) => setAccount(event.target.value)}
                error={invalidEmail}
                helperText={invalidEmail ? t.sign_in_account_cloud_backup_email_format_error() : ''}
                type="email"
            />
            <ButtonContainer>
                <Button
                    variant="rounded"
                    color="primary"
                    size="large"
                    onClick={() =>
                        toStep(ValidationCodeStep.AccountValidation, { account: account, type: AccountType.email })
                    }
                    disabled={!account || invalidEmail}>
                    {t.next()}
                </Button>
            </ButtonContainer>
        </>
    )
})
