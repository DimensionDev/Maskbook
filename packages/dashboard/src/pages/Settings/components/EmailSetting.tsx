import SettingButton from './SettingButton.js'
import { UserContext } from '../hooks/UserContext.js'
import { useContext, useState } from 'react'
import SettingEmailDialog from './dialogs/SettingEmailDialog.js'
import { useDashboardI18N } from '../../../locales/index.js'

export default function EmailSetting() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [open, setOpen] = useState(false)
    return (
        <>
            <SettingButton size="large" onClick={() => setOpen(true)}>
                {user.email ? t.settings_button_change() : t.settings_button_setup()}
            </SettingButton>
            {open ? <SettingEmailDialog open={open} onClose={() => setOpen(false)} /> : null}
        </>
    )
}
