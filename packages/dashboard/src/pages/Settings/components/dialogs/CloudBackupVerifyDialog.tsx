import { MaskDialog } from '@masknet/theme'
import { MenuItem, Select, TextField, Box, Button } from '@material-ui/core'
import { useDashboardI18N } from '../../../../locales'
import { useState, useContext } from 'react'
import { UserContext } from '../../hooks/UserContext'
import CountdownButton from '../../../../components/CountdownButton'
import { fetchDownloadLink, sendCode } from '../../api'
import type { BackupFileInfo } from '../../type'
export interface CloudBackupVerifyDialogProps {
    open: boolean
    onClose(): void
    onNext(file: BackupFileInfo | undefined): void
}

export function CloudBackupVerifyDialog({ open, onClose, onNext }: CloudBackupVerifyDialogProps) {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [mode, setMode] = useState((user.email ?? user.phone) || '')
    const [code, setCode] = useState('')
    const [invalidCode, setInvalidCode] = useState(false)

    const sendVerifyCode = () => {
        sendCode({
            account: mode,
            type: /@/.test(mode) ? 'email' : 'phone',
        })
    }

    const handleNext = async () => {
        const res = await fetchDownloadLink({
            account: mode,
            type: /@/.test(mode) ? 'email' : 'phone',
            code,
        }).catch((error) => {
            if (error.status === 400) {
                setInvalidCode(true)
            } else if (error.status === 404) {
                onNext(undefined)
            }
        })

        if (res) {
            onNext(res)
        }
    }

    return (
        <MaskDialog title="Cloud Backup" open={open} onClose={onClose}>
            <Box sx={{ padding: '10px 24px 24px' }}>
                <Select value={mode} onChange={(event) => setMode(event.target.value)} fullWidth size="small">
                    {user.email ? <MenuItem value={user.email}>{user.email}</MenuItem> : null}
                    {user.phone ? <MenuItem value={user.phone}>{user.phone}</MenuItem> : null}
                </Select>

                <Box sx={{ display: 'flex', paddingTop: '24px', alignItems: 'flex-start' }}>
                    <TextField
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

                <Button fullWidth sx={{ marginTop: '24px' }} onClick={handleNext}>
                    Next
                </Button>
            </Box>
        </MaskDialog>
    )
}
