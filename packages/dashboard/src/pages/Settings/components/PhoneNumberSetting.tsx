import SettingButton from './SettingButton'
import { UserContext } from '../hooks/UserContext'
import { useContext, useState } from 'react'
import SettingPhoneNumberDialog from './dialogs/SettingPhoneNumberDialog'
import { useDashboardI18N } from '../../../locales'

export default function PhoneNumberSetting() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [open, setOpen] = useState(false)
    return (
        <>
            <SettingButton size="large" onClick={() => setOpen(true)}>
                {user.phone ? t.settings_button_change() : t.settings_button_setup()}
            </SettingButton>
            {open ? <SettingPhoneNumberDialog open={open} onClose={() => setOpen(false)} /> : null}
        </>
    )
}
