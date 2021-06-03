import SettingButton from './SettingButton'
import { useState, useContext, useEffect } from 'react'
import BackupDialog from './dialogs/BackupDialog'
import { ModalContext } from '../hooks/VerifyPasswordContext'

export default function BackupSetting() {
    const { verified, verify } = useContext(ModalContext)
    const [checkVerify, setCheckVerify] = useState(false)
    const [openBackup, setOpenBackup] = useState(false)
    const handleOpenVeify = () => {
        if (!verified) {
            setCheckVerify(true)
            verify()
        } else {
            setOpenBackup(true)
        }
    }

    const handleCloseBackup = () => {
        setOpenBackup(false)
    }

    useEffect(() => {
        if (checkVerify && verified) {
            setOpenBackup(true)
        }
    }, [verified, checkVerify])

    return (
        <>
            <SettingButton onClick={handleOpenVeify}>Back up</SettingButton>
            <BackupDialog open={openBackup} onClose={handleCloseBackup} />
        </>
    )
}
