import { useDashboardI18N } from '../../../locales/index.js'
import { memo, useCallback, useState } from 'react'
import { PhoneNumberField } from '@masknet/theme'
import { ButtonContainer } from '../../RegisterFrame/ButtonContainer.js'
import { Button } from '@mui/material'
import { Label, ValidationCodeStep } from './common.js'
import type { StepCommonProps } from '../../Stepper/index.js'
import { AccountType } from '../../../pages/Settings/type.js'
import { phoneRegexp } from '../../../pages/Settings/regexp.js'

export const PhoneField = memo(({ toStep }: StepCommonProps) => {
    const t = useDashboardI18N()
    const [account, setAccount] = useState<string>('')
    const [invalidPhone, setInvalidPhone] = useState(false)

    const validCheck = () => {
        if (!account) return

        const isValid = phoneRegexp.test(account)
        setInvalidPhone(!isValid)
    }

    const handleClick = useCallback(() => {
        if (!phoneRegexp.test(account)) return
        toStep(ValidationCodeStep.AccountValidation, { account, type: AccountType.phone })
    }, [account])

    return (
        <>
            <PhoneNumberField
                onBlur={validCheck}
                label={<Label onModeChange={() => toStep(ValidationCodeStep.EmailInput)} mode={AccountType.phone} />}
                onChange={({ country, phone }) => setAccount(country + ' ' + phone)}
                error={invalidPhone ? t.sign_in_account_cloud_backup_phone_format_error() : ''}
                value={{
                    country: '+1',
                    phone: '',
                }}
            />
            <ButtonContainer>
                <Button
                    variant="rounded"
                    color="primary"
                    size="large"
                    onClick={() => handleClick()}
                    disabled={!account || invalidPhone}>
                    {t.next()}
                </Button>
            </ButtonContainer>
        </>
    )
})
