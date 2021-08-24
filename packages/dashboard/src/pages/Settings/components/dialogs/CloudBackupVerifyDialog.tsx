import { MaskDialog, CountdownButton, useSnackbar, MaskTextField, MaskColorVar } from '@masknet/theme'
import { MenuItem, Select, Box } from '@material-ui/core'
import { useDashboardI18N } from '../../../../locales'
import { useState, useContext, useMemo, useEffect } from 'react'
import { UserContext } from '../../hooks/UserContext'
import { fetchDownloadLink, sendCode, VerifyCodeRequest } from '../../api'
import type { BackupFileInfo, AccountValidationType } from '../../type'
import { LoadingButton } from '@material-ui/lab'
import { useAsyncFn } from 'react-use'

export interface VerifyNextData {
    fileInfo?: BackupFileInfo
    params: VerifyCodeRequest
}
export interface CloudBackupVerifyDialogProps {
    open: boolean
    onClose(): void
    onNext(data: VerifyNextData): void
}

export function CloudBackupVerifyDialog({ open, onClose, onNext }: CloudBackupVerifyDialogProps) {
    const snackbar = useSnackbar()
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [mode, setMode] = useState((user.email ?? user.phone) || '')
    const [code, setCode] = useState('')
    const [invalidCode, setInvalidCode] = useState(false)

    const params = useMemo(() => {
        return {
            account: mode,
            type: (mode.includes('@') ? 'email' : 'phone') as AccountValidationType,
            code,
        }
    }, [mode, code])

    const sendVerifyCode = async () => {
        const res = await sendCode(params).catch((error) =>
            snackbar.enqueueSnackbar(error.message, { variant: 'error' }),
        )

        if (res) {
            snackbar.enqueueSnackbar(t.settings_alert_validation_code_sent(), { variant: 'success' })
        }
    }

    const [{ loading }, handleNext] = useAsyncFn(async () => {
        const res = await fetchDownloadLink(params).catch((error) => {
            if (error.status === 400) {
                setInvalidCode(true)
            } else if (error.status === 404) {
                onNext({ params })
            }
        })

        if (res) {
            onNext({ fileInfo: res, params })
        }
    }, [params])

    useEffect(() => {
        setInvalidCode(false)
    }, [code])

    return (
        <MaskDialog title={t.settings_cloud_backup()} open={open} onClose={onClose}>
            <Box sx={{ padding: '10px 24px 24px' }}>
                <Select
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                    fullWidth
                    size="small"
                    sx={{ background: MaskColorVar.normalBackground }}>
                    {user.email ? <MenuItem value={user.email}>{user.email}</MenuItem> : null}
                    {user.phone ? <MenuItem value={user.phone}>{user.phone}</MenuItem> : null}
                </Select>

                <Box sx={{ display: 'flex', paddingTop: '24px', alignItems: 'flex-start' }}>
                    <MaskTextField
                        size="small"
                        sx={{ flex: 1, marginRight: '24px' }}
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        error={invalidCode}
                        helperText={invalidCode ? t.settings_dialogs_incorrect_code() : ''}
                    />
                    <CountdownButton size="medium" sx={{ width: '100px', height: '40px' }} onClick={sendVerifyCode}>
                        {t.settings_button_send()}
                    </CountdownButton>
                </Box>

                <LoadingButton fullWidth sx={{ marginTop: '24px' }} onClick={handleNext} loading={loading}>
                    {t.next()}
                </LoadingButton>
            </Box>
        </MaskDialog>
    )
}
