import { PageFrame } from '../../components/DashboardFrame'
import SettingCard from './components/SettingCard'
import SettingItem from './components/SettingItem'

import LanguageIcon from '@material-ui/icons/Language'
import PaletteIcon from '@material-ui/icons/Palette'
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows'
import SyncIcon from '@material-ui/icons/Sync'
import SaveIcon from '@material-ui/icons/Save'
import SaveAltIcon from '@material-ui/icons/SaveAlt'
import PermIdentityIcon from '@material-ui/icons/PermIdentity'
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone'
import LogoutIcon from '@material-ui/icons/Logout'

import { useDashboardI18N } from '../../locales'

import PasswordSettingItem from './components/PasswordSettingItem'

import LanguageSetting from './components/LanguageSetting'
import AppearanceSetting from './components/AppearanceSetting'
import AncientPostsSetting from './components/AncientPostsSetting'
import BackupSetting from './components/BackupSetting'
import RestoreSetting from './components/RestoreSetting'
import MobileSyncSetting from './components/MobileSyncSetting'
import EmailSetting from './components/EmailSetting'
import PhoneNumberSetting from './components/PhoneNumberSetting'
import LogoutSetting from './components/LogoutSetting'

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
                            icon={<DesktopWindowsIcon />}
                            title={t.settings_ancient_post_compatibility_mode_title()}
                            desc={t.settings_ancient_post_compatibility_mode_desc()}>
                            <AncientPostsSetting />
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
                    </SettingCard>

                    <SettingCard title={t.settings_profile()}>
                        <SettingItem
                            icon={<PermIdentityIcon />}
                            title={t.settigns_email_title()}
                            desc="alice@example.com">
                            <EmailSetting />
                        </SettingItem>
                        <SettingItem
                            icon={<PhoneIphoneIcon />}
                            title={t.settings_phone_number_title()}
                            desc="+86 13888888888">
                            <PhoneNumberSetting />
                        </SettingItem>
                        <SettingItem
                            icon={<LogoutIcon />}
                            title={t.settings_log_out_title()}
                            desc={t.settings_log_out_desc()}>
                            <LogoutSetting />
                        </SettingItem>
                    </SettingCard>
                </PasswordVerifiedProvider>
            </UserProvider>
        </PageFrame>
    )
}
