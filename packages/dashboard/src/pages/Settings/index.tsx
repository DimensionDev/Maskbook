import { PageFrame } from '../../components/DashboardFrame'
import SettingCard from './components/SettingCard'
import SettingItem from './components/SettingItem'

import LanguageIcon from '@material-ui/icons/Language'
import PaletteIcon from '@material-ui/icons/Palette'
import SyncIcon from '@material-ui/icons/Sync'
import SaveIcon from '@material-ui/icons/Save'
import SaveAltIcon from '@material-ui/icons/SaveAlt'

import { useDashboardI18N } from '../../locales'

import PasswordSettingItem from './components/PasswordSettingItem'
import EmailSettingItem from './components/EmailSettingItem'
import PhoneNumberSettingItem from './components/PhoneNumberSettingItem'

import LanguageSetting from './components/LanguageSetting'
import AppearanceSetting from './components/AppearanceSetting'
import BackupSetting from './components/BackupSetting'
import RestoreSetting from './components/RestoreSetting'
import MobileSyncSetting from './components/MobileSyncSetting'

import { PasswordVerifiedProvider } from './hooks/VerifyPasswordContext'
import { UserProvider } from './hooks/UserContext'

export default function Settings() {
    const t = useDashboardI18N()

    return (
        <PageFrame title={t.settings()} noBackgroundFill>
            <UserProvider>
                <PasswordVerifiedProvider>
                    <SettingCard title={t.settings_general()}>
                        <SettingItem
                            icon={<LanguageIcon />}
                            title={t.settings_language_title()}
                            desc={t.settings_language_desc()}>
                            <LanguageSetting />
                        </SettingItem>
                        <SettingItem
                            icon={<PaletteIcon />}
                            title={t.settings_appearance_title()}
                            desc={t.settings_appearance_desc()}>
                            <AppearanceSetting />
                        </SettingItem>
                        <SettingItem
                            icon={<SyncIcon />}
                            title={t.settings_sync_with_mobile_title()}
                            desc={t.settings_sync_with_mobile_desc()}>
                            <MobileSyncSetting />
                        </SettingItem>
                    </SettingCard>

                    <SettingCard title={t.settings_backup_recovery()}>
                        <SettingItem
                            icon={<SaveIcon />}
                            title={t.settings_global_backup_title()}
                            desc={t.settings_global_backup_desc()}>
                            <BackupSetting />
                        </SettingItem>
                        <SettingItem
                            icon={<SaveAltIcon />}
                            title={t.settings_restore_database_title()}
                            desc={t.settings_restore_database_desc()}>
                            <RestoreSetting />
                        </SettingItem>

                        <PasswordSettingItem />
                        <EmailSettingItem />
                        <PhoneNumberSettingItem />
                    </SettingCard>
                </PasswordVerifiedProvider>
            </UserProvider>
        </PageFrame>
    )
}
