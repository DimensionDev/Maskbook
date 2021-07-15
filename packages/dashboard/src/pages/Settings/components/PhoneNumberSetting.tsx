import SettingButton from './SettingButton'
import { UserContext } from '../hooks/UserContext'
import { useContext, useState } from 'react'
import SettingPhoneNumberDialog from './dialogs/SettingPhoneNumberDialog'

export default function PhoneNumberSetting() {
    const { user } = useContext(UserContext)
    const [open, setOpen] = useState(false)
    return (
        <>
            <SettingButton onClick={() => setOpen(true)}>{user.phone ? 'Change' : 'Setting'}</SettingButton>
            {open ? <SettingPhoneNumberDialog open={open} onClose={() => setOpen(false)} /> : null}
        </>
    )
}
