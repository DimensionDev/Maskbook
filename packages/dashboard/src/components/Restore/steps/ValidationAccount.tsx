import { useDashboardI18N } from '../../../locales'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { sendCode } from '../../../pages/Settings/api'
import { SendingCodeField } from '@masknet/theme'
import { Button, Typography } from '@material-ui/core'
import { ButtonGroup } from '../../RegisterFrame/ButtonGroup'
import type { CommonProps } from '../../stepper'
import { ValidationCodeStep } from './Commont'

interface ValidationAccountProps extends CommonProps {
    account: string
    type: AccountValidationType
    onNext(account: string, type: AccountValidationType, code: string): Promise<BackupFileInfo | { message: string }>
}

export const ValidationAccount = ({ account, toStep, type, onNext }: ValidationAccountProps) => {
    const t = useDashboardI18N()
    const [code, setCode] = useState('')
    const [error, setError] = useState('')

    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
        return sendCode({ account: account, type: type })
    }, [account, type])

    const handleNext = async () => {
        const backupInfo = await onNext(account, type, code)

        if ((backupInfo as BackupFileInfo).downloadURL) {
            setError('')
            toStep(ValidationCodeStep.ConfirmBackupInfo, { backupInfo: backupInfo, account: account })
        } else {
            setError((backupInfo as { message: string }).message)
        }
    }

    return (
        <>
            <SendingCodeField
                label={
                    <Typography variant="body2" sx={{ fontWeight: 'bolder' }} lineHeight="30px" color="textPrimary">
                        Send to {account}
                    </Typography>
                }
                onChange={(c) => setCode(c)}
                // todo : handle message in front end
                errorMessage={(sendCodeError && sendCodeError.message) || error}
                onSend={handleSendCodeFn}
            />
            <ButtonGroup>
                <Button variant="rounded" color="secondary" onClick={() => toStep(ValidationCodeStep.EmailInput)}>
                    {t.cancel()}
                </Button>
                <Button variant="rounded" color="primary" onClick={handleNext} disabled={!account || !code}>
                    {t.next()}
                </Button>
            </ButtonGroup>
        </>
    )
}
