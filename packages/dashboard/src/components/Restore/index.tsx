import { memo } from 'react'
import { Tab } from '@mui/material'
import { makeStyles, ButtonGroupTabList, useTabs } from '@masknet/theme'
import { useDashboardI18N } from '../../locales/index.js'
import { RestoreFromLocal } from './RestoreFromLocal.js'
import { RestoreFromMnemonic } from './RestoreFromMnemonic.js'
import { RestoreFromCloud } from './RestoreFromCloud.js'
import { RestoreFromPrivateKey } from './RestoreFromPrivateKey.js'
import { PersonaLogoBox } from '../RegisterFrame/ColumnContentLayout.js'
import { TabContext, TabPanel } from '@mui/lab'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    tabs: {
        width: '100%',
        display: 'flex',
        marginBottom: theme.spacing(4),
    },
    panels: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        width: '100%',
    },
}))

export const Restore = memo(() => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'privateKey', 'local', 'cloud')
    const tabPanelClasses = { root: classes.panels }

    return (
        <>
            <PersonaLogoBox>
                {['mnemonic', 'privateKey'].includes(currentTab) ? (
                    <Icons.SignUpAccount size={96} />
                ) : (
                    <Icons.LocalBackup size={96} />
                )}
            </PersonaLogoBox>
            <TabContext value={currentTab}>
                <ButtonGroupTabList
                    classes={{ root: classes.tabs }}
                    onChange={onChange}
                    aria-label={t.wallets_import_wallet_tabs()}>
                    <Tab label={t.sign_in_account_tab_identity()} value={tabs.mnemonic} />
                    <Tab label={t.wallets_wallet_private_key()} value={tabs.privateKey} />
                    <Tab label={t.wallets_wallet_json_file()} value={tabs.local} />
                    <Tab label={t.cloud_backup()} value={tabs.cloud} />
                </ButtonGroupTabList>
                <TabPanel value={tabs.mnemonic} classes={tabPanelClasses}>
                    <RestoreFromMnemonic />
                </TabPanel>
                <TabPanel value={tabs.privateKey} classes={tabPanelClasses}>
                    <RestoreFromPrivateKey />
                </TabPanel>
                <TabPanel value={tabs.local} classes={tabPanelClasses}>
                    <RestoreFromLocal />
                </TabPanel>
                <TabPanel value={tabs.cloud} classes={tabPanelClasses}>
                    <RestoreFromCloud />
                </TabPanel>
            </TabContext>
        </>
    )
})
