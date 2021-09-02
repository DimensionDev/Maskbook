import { useDashboardI18N } from '../../../locales'
import { memo, useState } from 'react'
import { PhoneNumberField } from '@masknet/theme'
import { ButtonContainer } from '../../RegisterFrame/ButtonContainer'
import { Button } from '@material-ui/core'
import { Label, ValidationCodeStep } from './Commont'
import type { StepCommonProps } from '../../Stepper'
import { AccountType } from '../../../pages/Settings/type'

export const PhoneField = memo(({ toStep }: StepCommonProps) => {
    const t = useDashboardI18N()
    const [account, setAccount] = useState<string>('')

    return (
        <>
            <PhoneNumberField
                label={<Label onModeChange={() => toStep(ValidationCodeStep.EmailInput)} mode={AccountType.phone} />}
                onChange={({ country, phone }) => setAccount(country + phone)}
                value={{
                    country: '+1',
                    phone: '',
                }}
            />
            <ButtonContainer>
                <Button
                    variant="rounded"
                    color="primary"
                    onClick={() =>
                        toStep(ValidationCodeStep.AccountValidation, { account: account, type: AccountType.phone })
                    }
                    disabled={!account}>
                    {t.next()}
                </Button>
            </ButtonContainer>
        </>
    )
})
