import { useDashboardI18N } from '../../../locales'
import { useState } from 'react'
import { MaskTextField } from '@masknet/theme'
import { ButtonGroup } from '../../RegisterFrame/ButtonGroup'
import { Button } from '@material-ui/core'
import { Label } from './Commont'
import type { CommonProps } from '../../stepper'

export const EmailField = ({ toStep }: CommonProps) => {
    const t = useDashboardI18N()
    const [account, setAccount] = useState<string>('')
    return (
        <>
            <MaskTextField
                label={<Label onModeChange={() => toStep('inputPhone')} mode="email" />}
                fullWidth
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                type="email"
                variant="outlined"
            />
            <ButtonGroup>
                <Button variant="rounded" color="secondary" onClick={() => {}}>
                    {t.cancel()}
                </Button>
                <Button
                    variant="rounded"
                    color="primary"
                    onClick={() => toStep('validation', { account: account, type: 'email' })}
                    disabled={!account}>
                    {t.next()}
                </Button>
            </ButtonGroup>
        </>
    )
}
