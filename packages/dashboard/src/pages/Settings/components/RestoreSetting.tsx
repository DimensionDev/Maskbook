import { useContext, useState } from 'react'
import RestoreDialog from './dialogs/RestoreDialog'
import SettingButton from './SettingButton'
import { PasswordVerifiedContext } from '../hooks/VerifyPasswordContext'

export default function RestoreSetting() {
    const { ensurePasswordVerified } = useContext(PasswordVerifiedContext)
    const [openRestore, setOpenRestore] = useState(false)
    const onRecovery = () => {
        ensurePasswordVerified(() => setOpenRestore(true))
    }

    const onClose = () => {
        setOpenRestore(false)
    }

    return (
        <>
            <SettingButton onClick={onRecovery}>Recovery</SettingButton>
            <RestoreDialog open={openRestore} onClose={onClose} />
        </>
    )
}
