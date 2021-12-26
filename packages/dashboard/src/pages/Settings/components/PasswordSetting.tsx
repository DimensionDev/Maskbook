import SettingButton from './SettingButton'
import SettingPasswordDialog from './dialogs/SettingPasswordDialog'
import { useState, useContext, useEffect } from 'react'
import { UserContext } from '../hooks/UserContext'
import { useDashboardI18N } from '../../../locales'
import { useLocation } from 'react-router-dom'

export default function PasswordSetting() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const { state } = useLocation() as { state: { open: string | null } }
    const [openSettingDialog, setOpenSettingDialog] = useState(false)

    useEffect(() => {
        if (!state?.open || state?.open !== 'password') return
        setOpenSettingDialog(true)
    }, [state?.open])

    return (
        <>
            <SettingButton size="large" onClick={() => setOpenSettingDialog(true)}>
                {user.backupPassword ? t.settings_button_change() : t.settings_button_setting()}
            </SettingButton>
            {openSettingDialog ? (
                <SettingPasswordDialog open={openSettingDialog} onClose={() => setOpenSettingDialog(false)} />
            ) : null}
        </>
    )
}
