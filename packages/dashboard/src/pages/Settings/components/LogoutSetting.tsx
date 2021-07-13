import { useState } from 'react'
import SettingButton from './SettingButton'
import LogoutDialog from './dialogs/LogoutDialog'

export default function LogoutSetting() {
    const [open, setOpen] = useState(false)
    return (
        <>
            <SettingButton color="error" onClick={() => setOpen(true)}>
                Log out
            </SettingButton>
            <LogoutDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
