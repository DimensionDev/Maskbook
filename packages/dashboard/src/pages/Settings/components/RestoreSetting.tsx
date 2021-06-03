import { useContext, useState } from 'react'
import RestoreDialog from './dialogs/RestoreDialog'
import SettingButton from './SettingButton'
import { ModalContext } from '../hooks/VerifyPasswordContext'

export default function RestoreSetting() {
    const { verified, verify } = useContext(ModalContext)
    const [openRestore, setOpenRestore] = useState(false)
    const handleOpenRestore = () => {
        if (!verified) {
            verify({
                onVerified: () => {
                    setOpenRestore(true)
                },
            })
        } else {
            setOpenRestore(true)
        }
    }

    const handleCloseRestore = () => {
        setOpenRestore(false)
    }

    return (
        <>
            <SettingButton onClick={handleOpenRestore}>Recovery</SettingButton>
            <RestoreDialog open={openRestore} onClose={handleCloseRestore} />
        </>
    )
}
