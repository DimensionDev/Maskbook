import { useState } from 'react'
import RestoreDialog from './dialogs/RestoreDialog'
import SettingButton from './SettingButton'

export default function RestoreSetting() {
    const [openRestore, setOpenRestore] = useState(false)
    const handleOpenRestore = () => {
        setOpenRestore(true)
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
