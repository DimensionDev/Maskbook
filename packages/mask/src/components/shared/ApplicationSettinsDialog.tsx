import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { memo, useEffect } from 'react'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList.js'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch.js'
import { ApplicationSettingTabs } from './ApplicationBoardDialog.js'
import type { PluginID } from '@masknet/shared-base'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../utils/index.js'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'

interface ApplicationBoardSettingsProps {
    focusPluginID?: PluginID
    tab?: ApplicationSettingTabs
}

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: theme.spacing(1.5, 2, '6px'),
            height: 'auto',
            overflow: 'hidden scroll',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

export const ApplicationBoardSettingsDialog = memo<ApplicationBoardSettingsProps>(
    ({ focusPluginID, tab = ApplicationSettingTabs.pluginSwitch }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const [currentTab, onChange, tabs, setTab] = useTabs(
            ApplicationSettingTabs.pluginList,
            ApplicationSettingTabs.pluginSwitch,
        )

        const { open, closeDialog } = useRemoteControlledDialog(
            WalletMessages.events.applicationSettingsDialogUpdated,
            (evt) => {
                if (!evt.open) return
                setTab(ApplicationSettingTabs.pluginSwitch)
            },
        )

        useEffect(() => setTab(tab), [tab])
        return (
            <TabContext value={currentTab}>
                <InjectedDialog
                    open={open}
                    maxWidth="sm"
                    onClose={closeDialog}
                    titleTabs={
                        <MaskTabList variant="base" onChange={onChange} aria-label="ApplicationBoard">
                            <Tab label={t('application_settings_tab_app_list')} value={tabs.pluginList} />
                            <Tab label={t('application_settings_tab_plug_in_switch')} value={tabs.pluginSwitch} />
                        </MaskTabList>
                    }
                    title={t('application_settings')}>
                    <DialogContent className={classes.content}>
                        <TabPanel value={tabs.pluginList} style={{ padding: 0 }}>
                            <ApplicationSettingPluginList />
                        </TabPanel>
                        <TabPanel value={tabs.pluginSwitch} style={{ padding: 0 }}>
                            <ApplicationSettingPluginSwitch focusPluginID={focusPluginID} />
                        </TabPanel>
                    </DialogContent>
                </InjectedDialog>
            </TabContext>
        )
    },
)
