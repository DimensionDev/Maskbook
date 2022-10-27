import { PageFrame } from '../../components/PageFrame/index.js'
import SettingCard from './components/SettingCard.js'
import SettingItem from './components/SettingItem.js'

import { useDashboardI18N } from '../../locales/index.js'

import BackupSettingItem from './components/BackupSettingItem.js'
import PasswordSettingItem from './components/PasswordSettingItem.js'
import EmailSettingItem from './components/EmailSettingItem.js'
import PhoneNumberSettingItem from './components/PhoneNumberSettingItem.js'

import LanguageSetting from './components/LanguageSetting.js'
import AppearanceSetting from './components/AppearanceSetting.js'
import RestoreSetting from './components/RestoreSetting.js'

import { UserProvider } from './hooks/UserContext.js'
import { Icons } from '@masknet/icons'

export default function Settings() {
    const t = useDashboardI18N()

    return (
        <PageFrame title={t.settings()} noBackgroundFill>
            <UserProvider>
                <SettingCard title={t.settings_general()}>
                    <SettingItem
                        icon={<Icons.SettingsLanguage />}
                        title={t.settings_language_title()}
                        desc={t.settings_language_desc()}>
                        <LanguageSetting />
                    </SettingItem>
                    <SettingItem
                        icon={<Icons.SettingsAppearance />}
                        title={t.settings_appearance_title()}
                        desc={t.settings_appearance_desc()}>
                        <AppearanceSetting />
                    </SettingItem>
                </SettingCard>

                <SettingCard title={t.settings_backup_recovery()}>
                    <BackupSettingItem />
                    <SettingItem
                        icon={<Icons.SettingsRestore />}
                        title={t.settings_restore_database_title()}
                        desc={t.settings_restore_database_desc()}>
                        <RestoreSetting />
                    </SettingItem>

                    <PasswordSettingItem />
                    <EmailSettingItem />
                    <PhoneNumberSettingItem />
                </SettingCard>
            </UserProvider>
        </PageFrame>
    )
}
