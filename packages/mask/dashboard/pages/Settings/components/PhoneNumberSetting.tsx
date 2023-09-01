import SettingButton from './SettingButton.js'
import { UserContext } from '../hooks/UserContext.js'
import { useContext, useState } from 'react'
import SettingPhoneNumberDialog from './dialogs/SettingPhoneNumberDialog.js'
import { useDashboardI18N } from '../../../locales/index.js'

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
