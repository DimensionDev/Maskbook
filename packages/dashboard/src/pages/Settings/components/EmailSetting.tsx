import SettingButton from './SettingButton'
import { UserContext } from '../hooks/UserContext'
import { useContext, useState } from 'react'
import SettingEmailDialog from './dialogs/SettingEmailDialog'

export default function EmailSetting() {
    const { user } = useContext(UserContext)
    const [open, setOpen] = useState(false)
    return (
        <>
            <SettingButton onClick={() => setOpen(true)}>{user.email ? 'Change' : 'Setting'}</SettingButton>
            {open ? <SettingEmailDialog open={open} onClose={() => setOpen(false)} /> : null}
        </>
    )
}
