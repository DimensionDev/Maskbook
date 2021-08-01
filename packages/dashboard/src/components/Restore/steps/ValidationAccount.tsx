import { useDashboardI18N } from '../../../locales'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { sendCode } from '../../../pages/Settings/api'
import { SendingCodeField } from '@masknet/theme'
import { Button, Typography } from '@material-ui/core'
import { ButtonGroup } from '../../RegisterFrame/ButtonGroup'
import type { CommonProps } from '../../stepper'

interface ValidationAccountProps extends CommonProps {
    account: string
    type: AccountValidationType
    onNext(account: string, type: AccountValidationType, code: string): Promise<any>
}

export const ValidationAccount = ({ account, toStep, type, onNext }: ValidationAccountProps) => {
    const t = useDashboardI18N()
    const [code, setCode] = useState('')
    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
        return sendCode({ account: account, type: type })
    }, [account])

    const handleNext = async () => {
        const backupInfo = await onNext(account, type, code)
        if (backupInfo) {
            toStep('confirm', { backupInfo: backupInfo, account: account })
        }
    }

    return (
        <>
            <SendingCodeField
                label={
                    <Typography variant="body2" sx={{ fontWeight: 'bolder' }} color="textPrimary">
                        Send to {account}
                    </Typography>
                }
                onChange={(c) => setCode(c)}
                // todo : message
                errorMessage={sendCodeError && sendCodeError.message}
                onSend={handleSendCodeFn}
            />
            <ButtonGroup>
                <Button
                    variant="rounded"
                    color="secondary"
                    onClick={() => toStep('inputEmail', { account: account, type: 'phone' })}>
                    {t.cancel()}
                </Button>
                <Button variant="rounded" color="primary" onClick={handleNext} disabled={!account}>
                    {t.next()}
                </Button>
            </ButtonGroup>
        </>
    )
}
