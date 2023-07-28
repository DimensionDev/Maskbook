import { MaskTabList, useTabs } from '@masknet/theme'
import { useState } from 'react'
import { ApplicationSettingTabs } from './ApplicationBoardDialog.js'
import { TabContext, TabPanel } from '@mui/lab'
import { IconButton, Tab } from '@mui/material'
import type { DashboardRoutes, PersonaInformation, PluginID } from '@masknet/shared-base'
import type { CurrentSNSNetwork, IdentityResolved } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList.js'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch.js'
import { ApplicationBoardContent } from './ApplicationBoard.js'
import { useSharedI18N, type PersonaAgainstSNSConnectStatus } from '../../../index.js'

interface ApplicationBoardFormProps {
    openDashboard?: (route?: DashboardRoutes, search?: string) => void
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    currentSNSNetwork?: CurrentSNSNetwork
    allPersonas: PersonaInformation[]
    lastRecognized?: IdentityResolved
    applicationCurrentStatus?: PersonaAgainstSNSConnectStatus
    personaAgainstSNSConnectStatusLoading: boolean
    setPluginMinimalModeEnabled?: (id: string, checked: boolean) => Promise<void>
    getDecentralizedSearchSettings?: () => Promise<boolean>
    setDecentralizedSearchSettings?: (checked: boolean) => Promise<void>

    focusPluginID?: PluginID
    tab?: ApplicationSettingTabs
    quickMode?: boolean
}
export function ApplicationBoardForm(props: ApplicationBoardFormProps) {
    const t = useSharedI18N()
    const [openSettings, setOpenSettings] = useState(false)
    const [currentTab, onChange, tabs, setTab] = useTabs(
        ApplicationSettingTabs.pluginList,
        ApplicationSettingTabs.pluginSwitch,
    )

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                    size="small"
                    sx={{ margin: '-5px' }}
                    onClick={() => setOpenSettings((openSettings) => !openSettings)}>
                    <Icons.Gear size={24} />
                </IconButton>
            </div>
            {openSettings ? (
                <TabContext value={currentTab}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="ApplicationBoard">
                        <Tab label={t.application_settings_tab_app_list()} value={tabs.pluginList} />
                        <Tab label={t.application_settings_tab_plug_in_switch()} value={tabs.pluginSwitch} />
                    </MaskTabList>

                    <TabPanel value={tabs.pluginList} style={{ padding: 0 }}>
                        <ApplicationSettingPluginList />
                    </TabPanel>
                    <TabPanel value={tabs.pluginSwitch} style={{ padding: 0 }}>
                        <ApplicationSettingPluginSwitch
                            focusPluginID={props.focusPluginID}
                            setPluginMinimalModeEnabled={props.setPluginMinimalModeEnabled}
                            getDecentralizedSearchSettings={props.getDecentralizedSearchSettings}
                            setDecentralizedSearchSettings={props.setDecentralizedSearchSettings}
                        />
                    </TabPanel>
                </TabContext>
            ) : (
                <ApplicationBoardContent
                    openDashboard={props.openDashboard}
                    queryOwnedPersonaInformation={props.queryOwnedPersonaInformation}
                    currentSNSNetwork={props.currentSNSNetwork}
                    lastRecognized={props.lastRecognized}
                    allPersonas={props.allPersonas}
                    applicationCurrentStatus={props.applicationCurrentStatus}
                    personaAgainstSNSConnectStatusLoading={props.personaAgainstSNSConnectStatusLoading}
                />
            )}
        </>
    )
}
