import { useDashboardI18N } from '../../../locales'
import { useState } from 'react'
import { PhoneNumberField } from '@masknet/theme'
import { ButtonGroup } from '../../RegisterFrame/ButtonGroup'
import { Button } from '@material-ui/core'
import { Label, ValidationCodeStep } from './Commont'
import type { CommonProps } from '../../stepper'

export const PhoneField = ({ toStep }: CommonProps) => {
    const t = useDashboardI18N()
    const [account, setAccount] = useState<string>('')

    return (
        <>
            <PhoneNumberField
                label={<Label onModeChange={() => toStep(ValidationCodeStep.EmailInput)} mode="phone" />}
                onChange={({ country, phone }) => setAccount(country + phone)}
                value={{
                    country: '+1',
                    phone: '',
                }}
            />
            <ButtonGroup>
                <Button variant="rounded" color="secondary" onClick={() => {}}>
                    {t.cancel()}
                </Button>
                <Button
                    variant="rounded"
                    color="primary"
                    onClick={() => toStep(ValidationCodeStep.AccountValidation, { account: account, type: 'phone' })}
                    disabled={!account}>
                    {t.next()}
                </Button>
            </ButtonGroup>
        </>
    )
}
