import { PageFrame } from '../../components/PageFrame'
import SettingCard from './components/SettingCard'
import SettingItem from './components/SettingItem'

import { useDashboardI18N } from '../../locales'

import BackupSettingItem from './components/BackupSettingItem'
import PasswordSettingItem from './components/PasswordSettingItem'
import EmailSettingItem from './components/EmailSettingItem'
import PhoneNumberSettingItem from './components/PhoneNumberSettingItem'

import LanguageSetting from './components/LanguageSetting'
import AppearanceSetting from './components/AppearanceSetting'
import RestoreSetting from './components/RestoreSetting'
// import MobileSyncSetting from './components/MobileSyncSetting'

import { PasswordVerifiedProvider } from './hooks/VerifyPasswordContext'
import { UserProvider } from './hooks/UserContext'
import { SettingsAppearanceIcon, SettingsLanguageIcon, SettingsRestoreIcon } from '@masknet/icons'

export default function Settings() {
    const t = useDashboardI18N()

    return (
        <PageFrame title={t.settings()} noBackgroundFill>
            <UserProvider>
                <PasswordVerifiedProvider>
                    <SettingCard title={t.settings_general()}>
                        <SettingItem
                            icon={<SettingsLanguageIcon />}
                            title={t.settings_language_title()}
                            desc={t.settings_language_desc()}>
                            <LanguageSetting />
                        </SettingItem>
                        <SettingItem
                            icon={<SettingsAppearanceIcon />}
                            title={t.settings_appearance_title()}
                            desc={t.settings_appearance_desc()}>
                            <AppearanceSetting />
                        </SettingItem>
                        {/* <SettingItem
                            icon={<SettingsSyncIcon />}
                            title={t.settings_sync_with_mobile_title()}
                            desc={t.settings_sync_with_mobile_desc()}>
                            <MobileSyncSetting />
                        </SettingItem> */}
                    </SettingCard>

                    <SettingCard title={t.settings_backup_recovery()}>
                        <BackupSettingItem />
                        <SettingItem
                            icon={<SettingsRestoreIcon />}
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
