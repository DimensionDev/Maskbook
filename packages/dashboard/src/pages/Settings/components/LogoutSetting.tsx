import { useState } from 'react'
import SettingButton from './SettingButton'
import LogoutDialog from './dialogs/LogoutDialog'
import { useDashboardI18N } from '../../../locales'

export default function LogoutSetting() {
    const t = useDashboardI18N()
    const [open, setOpen] = useState(false)
    return (
        <>
            <SettingButton color="error" onClick={() => setOpen(true)}>
                {t.settings_log_out_title()}
            </SettingButton>
            <LogoutDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
