import { MaskDialog, CountdownButton, useCustomSnackbar, MaskTextField, MaskColorVar } from '@masknet/theme'
import { MenuItem, Select, Box } from '@mui/material'
import { useDashboardI18N } from '../../../../locales/index.js'
import { useState, useContext, useMemo, useEffect } from 'react'
import { UserContext } from '../../hooks/UserContext.js'
import { fetchDownloadLink, sendCode, type VerifyCodeRequest } from '../../api.js'
import { useLanguage } from '../../../../../shared-ui/index.js'
import { type BackupFileInfo, AccountType, Scenario, Locale } from '../../type.js'
import { LoadingButton } from '../../../../components/LoadingButton/index.js'
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
    const language = useLanguage()
    const { showSnackbar } = useCustomSnackbar()
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [mode, setMode] = useState(user.email || user.phone || '')
    const [code, setCode] = useState('')
    const [invalidCode, setInvalidCode] = useState(false)

    const params = useMemo(() => {
        return {
            account: mode,
            type: mode.includes('@') ? AccountType.Email : AccountType.Phone,
            scenario: Scenario.backup,
            locale: language.includes('zh') ? Locale.zh : Locale.en,
            code,
        }
    }, [mode, code])

    const sendVerifyCode = async () => {
        const res = await sendCode(params).catch((error) => showSnackbar(error.message, { variant: 'error' }))

        if (res) {
            showSnackbar(t.settings_alert_validation_code_sent(), { variant: 'success' })
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
                    <CountdownButton
                        size="medium"
                        sx={{ width: '100px', height: '40px' }}
                        repeatContent={t.resend()}
                        onClick={sendVerifyCode}>
                        {t.send()}
                    </CountdownButton>
                </Box>

                <LoadingButton fullWidth sx={{ marginTop: '24px' }} onClick={handleNext} loading={loading}>
                    {t.next()}
                </LoadingButton>
            </Box>
        </MaskDialog>
    )
}
