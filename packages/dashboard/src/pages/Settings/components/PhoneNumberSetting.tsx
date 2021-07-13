import SettingButton from './SettingButton'
import { UserContext } from '../hooks/UserContext'
import { useContext } from 'react'

export default function PhoneNumberSetting() {
    const { user } = useContext(UserContext)
    return <SettingButton>{user.phone ? 'Change' : 'Setting'}</SettingButton>
}
