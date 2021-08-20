import SettingButton from './SettingButton'
import SettingPasswordDialog from './dialogs/SettingPasswordDialog'
import { useState, useContext } from 'react'
import { UserContext } from '../hooks/UserContext'
import { useDashboardI18N } from '../../../locales'

export default function PasswordSetting() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [openSettingDialog, setOpenSettingDialog] = useState(false)

    return (
        <>
            <SettingButton onClick={() => setOpenSettingDialog(true)}>
                {user.backupPassword ? t.settings_button_change() : t.settings_button_setting()}
            </SettingButton>
            {openSettingDialog ? (
                <SettingPasswordDialog open={openSettingDialog} onClose={() => setOpenSettingDialog(false)} />
            ) : null}
        </>
    )
}
