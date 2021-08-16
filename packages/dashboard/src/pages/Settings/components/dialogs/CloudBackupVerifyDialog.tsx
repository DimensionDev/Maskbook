import { MaskDialog } from '@masknet/theme'
import { MenuItem, Select, TextField, Box, Button } from '@material-ui/core'
import { useDashboardI18N } from '../../../../locales'
import { useState, useContext } from 'react'
import { UserContext } from '../../hooks/UserContext'
import CountdownButton from '../../../../components/CountdownButton'
import { download, sendCode } from '../../api'

export interface FileInfo {
    url: string
    size: number
    uploadedAt: Date
    abstract: {
        personas: string[]
    }
}

export interface CloudBackupVerifyDialogProps {
    open: boolean
    onClose(): void
    onNext(file: FileInfo | undefined): void
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
        const res = await download({
            account: mode,
            type: /@/.test(mode) ? 'email' : 'phone',
            code,
        }).catch((error) => {
            console.log(error)
        })

        if (res?.status === 400) {
            setInvalidCode(true)
        } else if (res?.status === 404) {
            // no backup
            onNext(undefined)
        } else if (res?.status === 201) {
            const info = await res.json()
            onNext({
                url: info.download_url,
                size: info.size,
                uploadedAt: new Date(info.uploaded_at * 1000),
                abstract: JSON.parse(info.abstract),
            })
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
