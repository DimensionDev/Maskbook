import { memo } from 'react'
import { Tab } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { ButtonGroupTabList, useTabs } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { RestoreFromLocal } from './RestoreFromLocal'
import { RestoreFromMnemonic } from './RestoreFromMnemonic'
import { RestoreFromCloud } from './RestoreFromCloud'
import { RestoreFromPrivateKey } from './RestoreFromPrivateKey'
import { RestoreBlueLogo, SignUpAccountLogo } from '../RegisterFrame/ColumnContentLayout'
import { TabContext, TabPanel } from '@material-ui/lab'

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
    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'privateKey', 'json', 'cloud')
    const tabPanelClasses = { root: classes.panels }

    return (
        <>
            {['mnemonic', 'privateKey'].includes(currentTab) ? <SignUpAccountLogo /> : <RestoreBlueLogo />}
            <TabContext value={currentTab}>
                <ButtonGroupTabList
                    classes={{ root: classes.tabs }}
                    onChange={onChange}
                    aria-label={t.wallets_import_wallet_tabs()}>
                    <Tab label={t.wallets_wallet_mnemonic()} value={tabs.mnemonic} />
                    <Tab label={t.wallets_wallet_private_key()} value={tabs.privateKey} />
                    <Tab label={t.wallets_wallet_json_file()} value={tabs.json} />
                    <Tab label={t.cloud_backup()} value={tabs.cloud} />
                </ButtonGroupTabList>
                <TabPanel value={tabs.mnemonic} classes={tabPanelClasses}>
                    <RestoreFromMnemonic />
                </TabPanel>
                <TabPanel value={tabs.privateKey} classes={tabPanelClasses}>
                    <RestoreFromPrivateKey />
                </TabPanel>
                <TabPanel value={tabs.json} classes={tabPanelClasses}>
                    <RestoreFromLocal />
                </TabPanel>
                <TabPanel value={tabs.cloud} classes={tabPanelClasses}>
                    <RestoreFromCloud />
                </TabPanel>
            </TabContext>
        </>
    )
})
