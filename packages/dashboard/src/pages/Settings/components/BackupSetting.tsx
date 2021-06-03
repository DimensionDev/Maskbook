import SettingButton from './SettingButton'
import { useState, useContext } from 'react'
import BackupDialog from './dialogs/BackupDialog'
import { ModalContext } from '../hooks/VerifyPasswordContext'

export default function BackupSetting() {
    const { verified, verify } = useContext(ModalContext)
    const [openBackup, setOpenBackup] = useState(false)
    const handleOpenVeify = () => {
        if (!verified) {
            verify({
                onVerified: () => {
                    setOpenBackup(true)
                },
            })
        } else {
            setOpenBackup(true)
        }
    }

    const handleCloseBackup = () => {
        setOpenBackup(false)
    }

    return (
        <>
            <SettingButton onClick={handleOpenVeify}>Back up</SettingButton>
            <BackupDialog open={openBackup} onClose={handleCloseBackup} />
        </>
    )
}
