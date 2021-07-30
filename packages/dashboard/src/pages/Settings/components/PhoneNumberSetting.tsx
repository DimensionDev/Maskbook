import SettingButton from './SettingButton'
import { UserContext } from '../hooks/UserContext'
import { useContext, useState } from 'react'
import { useDashboardI18N } from '../../../locales'
import SettingPhoneNumberDialog from './dialogs/SettingPhoneNumberDialog'

export default function PhoneNumberSetting() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [open, setOpen] = useState(false)
    return (
        <>
            <SettingButton onClick={() => setOpen(true)}>
                {user.phone ? t.settings_button_change() : t.settings_button_setting()}
            </SettingButton>
            {open ? <SettingPhoneNumberDialog open={open} onClose={() => setOpen(false)} /> : null}
        </>
    )
}
