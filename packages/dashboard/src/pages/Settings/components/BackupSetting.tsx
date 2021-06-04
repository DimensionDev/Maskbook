import SettingButton from './SettingButton'
import { useState, useContext } from 'react'
import BackupDialog from './dialogs/BackupDialog'
import { PasswordVerifiedContext } from '../hooks/VerifyPasswordContext'

export default function BackupSetting() {
    const { isPasswordVerified, requestVerifyPassword } = useContext(PasswordVerifiedContext)
    const [openBackup, setOpenBackup] = useState(false)
    const onBackup = () => {
        if (isPasswordVerified) {
            setOpenBackup(true)
        } else {
            requestVerifyPassword({
                onVerified: () => {
                    setOpenBackup(true)
                },
            })
        }
    }

    const onClose = () => {
        setOpenBackup(false)
    }

    return (
        <>
            <SettingButton onClick={onBackup}>Back up</SettingButton>
            <BackupDialog open={openBackup} onClose={onClose} />
        </>
    )
}
