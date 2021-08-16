import { useContext, useState } from 'react'
import RestoreDialog from './dialogs/RestoreDialog'
import SettingButton from './SettingButton'
import { PasswordVerifiedContext } from '../hooks/VerifyPasswordContext'
import { useDashboardI18N } from '../../../locales'

export default function RestoreSetting() {
    const t = useDashboardI18N()
    const { ensurePasswordVerified } = useContext(PasswordVerifiedContext)
    const [openRestore, setOpenRestore] = useState(false)
    const onRecovery = () => {
        ensurePasswordVerified(() => setOpenRestore(true))
    }

    const onClose = () => {
        setOpenRestore(false)
    }

    return (
        <>
            <SettingButton onClick={onRecovery}>{t.settings_button_recovery()}</SettingButton>
            <RestoreDialog open={openRestore} onClose={onClose} />
        </>
    )
}
