import SettingButton from './SettingButton'
import { useState, useContext } from 'react'
import BackupDialog from './dialogs/BackupDialog'
import { PasswordVerifiedContext } from '../hooks/VerifyPasswordContext'

export default function BackupSetting() {
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
            <SettingButton onClick={onBackup}>Backup</SettingButton>
            <BackupDialog open={openBackup} onClose={onClose} />
        </>
    )
}
