import SettingButton from './SettingButton'
import { useState, useContext } from 'react'
import BackupDialog from './dialogs/BackupDialog'
import { PasswordVerifiedContext } from '../hooks/VerifyPasswordContext'
import { useDashboardI18N } from '../../../locales'

export default function BackupSetting() {
    const t = useDashboardI18N()
    const { ensurePasswordVerified } = useContext(PasswordVerifiedContext)
    const [openBackup, setOpenBackup] = useState(false)
    const onBackup = () => {
        ensurePasswordVerified(() => setOpenBackup(true))
    }

    const onClose = () => {
        setOpenBackup(false)
    }

    return (
        <>
            <SettingButton onClick={onBackup}>{t.settings_button_backup()}</SettingButton>
            <BackupDialog open={openBackup} onClose={onClose} />
        </>
    )
}
