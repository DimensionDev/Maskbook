import SettingButton from './SettingButton'
import SettingPasswordDialog from './dialogs/SettingPasswordDialog'
import { useState, useContext } from 'react'
import { UserContext } from '../hooks/UserContext'

export default function PasswordSetting() {
    const { user } = useContext(UserContext)
    const [openSettingDialog, setOpenSettingDialog] = useState(false)

    return (
        <>
            <SettingButton onClick={() => setOpenSettingDialog(true)}>
                {user.backupPassword ? 'Change' : 'Setting'}
            </SettingButton>
            {openSettingDialog ? (
                <SettingPasswordDialog open={openSettingDialog} onClose={() => setOpenSettingDialog(false)} />
            ) : null}
        </>
    )
}
