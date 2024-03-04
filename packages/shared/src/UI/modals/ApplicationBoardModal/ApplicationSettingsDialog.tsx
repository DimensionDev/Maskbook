import { memo, useEffect } from 'react'
import { TabContext, TabPanel } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import type { PluginID } from '@masknet/shared-base'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList.js'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch.js'
import { ApplicationSettingTabs } from './ApplicationBoardDialog.js'
import { useSharedTrans } from '../../../locales/index.js'
import { InjectedDialog } from '../../../index.js'

interface ApplicationBoardSettingsProps {
    open: boolean
    onClose: () => void
    focusPluginID?: PluginID
    tab?: ApplicationSettingTabs
    setPluginMinimalModeEnabled?: (id: string, checked: boolean) => Promise<void>
}

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: theme.spacing(1.5, 2, '6px'),
            height: 'auto',
            overflow: 'hidden scroll',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

export const ApplicationBoardSettingsDialog = memo<ApplicationBoardSettingsProps>(
    ({ focusPluginID, setPluginMinimalModeEnabled, open, onClose, tab = ApplicationSettingTabs.pluginSwitch }) => {
        const t = useSharedTrans()
        const { classes } = useStyles()
        const [currentTab, onChange, tabs, setTab] = useTabs(
            ApplicationSettingTabs.pluginList,
            ApplicationSettingTabs.pluginSwitch,
        )

        useEffect(() => setTab(tab), [tab])
        return (
            <TabContext value={currentTab}>
                <InjectedDialog
                    open={open}
                    maxWidth="sm"
                    onClose={onClose}
                    titleTabs={
                        <MaskTabList variant="base" onChange={onChange} aria-label="ApplicationBoard">
                            <Tab label={t.application_settings_tab_app_list()} value={tabs.pluginList} />
                            <Tab label={t.application_settings_tab_plug_in_switch()} value={tabs.pluginSwitch} />
                        </MaskTabList>
                    }
                    title={t.application_settings()}>
                    <DialogContent className={classes.content}>
                        <TabPanel value={tabs.pluginList} style={{ padding: 0 }}>
                            <ApplicationSettingPluginList />
                        </TabPanel>
                        <TabPanel value={tabs.pluginSwitch} style={{ padding: 0 }}>
                            <ApplicationSettingPluginSwitch
                                focusPluginID={focusPluginID}
                                setPluginMinimalModeEnabled={setPluginMinimalModeEnabled}
                            />
                        </TabPanel>
                    </DialogContent>
                </InjectedDialog>
            </TabContext>
        )
    },
)
