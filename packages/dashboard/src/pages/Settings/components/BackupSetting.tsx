import SettingButton from './SettingButton'
import VerifyPasswordDialog from './dialogs/VerifyPasswordDialog'
import { useState } from 'react'
import BackupDialog from './dialogs/BackupDialog'

export default function BackupSetting() {
    const [openVerify, setOpenVerify] = useState(false)
    const [openBackup, setOpenBackup] = useState(false)
    const [verified, setVerified] = useState(false)
    const handleOpenVeify = () => {
        verified ? setOpenBackup(true) : setOpenVerify(true)
    }

    const handlePasswordVerified = () => {
        setVerified(true)
        // open backup dialog
        setTimeout(() => {
            setOpenBackup(true)
        }, 500)
    }

    const handleCloseVerify = () => {
        setOpenVerify(false)
    }

    const handleCloseBackup = () => {
        setOpenBackup(false)
    }

    return (
        <>
            <SettingButton onClick={handleOpenVeify}>Back up</SettingButton>
            <VerifyPasswordDialog open={openVerify} onVerified={handlePasswordVerified} onClose={handleCloseVerify} />
            <BackupDialog open={openBackup} onClose={handleCloseBackup} />
        </>
    )
}
