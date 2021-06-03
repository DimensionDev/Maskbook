import { useContext, useEffect, useState } from 'react'
import RestoreDialog from './dialogs/RestoreDialog'
import SettingButton from './SettingButton'
import { ModalContext } from '../hooks/VerifyPasswordContext'

export default function RestoreSetting() {
    const { verified, verify } = useContext(ModalContext)
    const [checkVerify, setCheckVerify] = useState(false)
    const [openRestore, setOpenRestore] = useState(false)
    const handleOpenRestore = () => {
        if (!verified) {
            setCheckVerify(true)
            verify()
        } else {
            setOpenRestore(true)
        }
    }

    const handleCloseRestore = () => {
        setOpenRestore(false)
    }

    useEffect(() => {
        if (checkVerify && verified) {
            setOpenRestore(true)
        }
    }, [verified, checkVerify])

    return (
        <>
            <SettingButton onClick={handleOpenRestore}>Recovery</SettingButton>
            <RestoreDialog open={openRestore} onClose={handleCloseRestore} />
        </>
    )
}
