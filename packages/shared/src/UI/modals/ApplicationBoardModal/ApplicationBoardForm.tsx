import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { useState } from 'react'
import { ApplicationSettingTabs } from './ApplicationBoardDialog.js'
import { TabContext, TabPanel } from '@mui/lab'
import { IconButton, Stack, Tab } from '@mui/material'
import type { DashboardRoutes, PersonaInformation, PluginID } from '@masknet/shared-base'
import type { CurrentSNSNetwork, IdentityResolved } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList.js'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch.js'
import { ApplicationBoardContent } from './ApplicationBoard.js'
import { useSharedI18N, type PersonaAgainstSNSConnectStatus } from '../../../index.js'
import { ArrowBackRounded as ArrowBackRoundedIcon } from '@mui/icons-material'

const useStyles = makeStyles()((theme) => ({
    applicationWrapper: {
        maxHeight: 'initial',
        width: 'auto',
    },
    title: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 1,
        flexDirection: 'column',
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                : 'linear-gradient(rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%);',
    },
    tool: {
        display: 'flex',
        justifyContent: 'end',
        padding: 1,
        marginLeft: 'auto',
        marginRight: 'auto',
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                : 'linear-gradient(rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)',
    },
    recommendFeatureAppListWrapper: {},
}))
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
    const { classes } = useStyles()

    return (
        <>
            {openSettings ? (
                <TabContext value={currentTab}>
                    <Stack className={classes.title}>
                        <div style={{ display: 'flex', flex: 1, justifyContent: 'start', padding: 8 }}>
                            <IconButton
                                size="small"
                                sx={{ margin: '-5px' }}
                                onClick={() => setOpenSettings((openSettings) => !openSettings)}>
                                <ArrowBackRoundedIcon />
                            </IconButton>
                        </div>
                        <MaskTabList variant="base" onChange={onChange} aria-label="ApplicationBoard">
                            <Tab label={t.application_settings_tab_app_list()} value={tabs.pluginList} />
                            <Tab label={t.application_settings_tab_plug_in_switch()} value={tabs.pluginSwitch} />
                        </MaskTabList>
                    </Stack>

                    <TabPanel value={tabs.pluginList} style={{ padding: 8, maxHeight: 600, overflowY: 'auto' }}>
                        <ApplicationSettingPluginList />
                    </TabPanel>
                    <TabPanel value={tabs.pluginSwitch} style={{ padding: 8, maxHeight: 600, overflowY: 'auto' }}>
                        <ApplicationSettingPluginSwitch
                            focusPluginID={props.focusPluginID}
                            setPluginMinimalModeEnabled={props.setPluginMinimalModeEnabled}
                            getDecentralizedSearchSettings={props.getDecentralizedSearchSettings}
                            setDecentralizedSearchSettings={props.setDecentralizedSearchSettings}
                        />
                    </TabPanel>
                </TabContext>
            ) : (
                <>
                    <Stack className={classes.tool}>
                        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', padding: 8 }}>
                            <IconButton
                                size="small"
                                sx={{ margin: '-5px' }}
                                onClick={() => setOpenSettings((openSettings) => !openSettings)}>
                                <Icons.Gear size={24} />
                            </IconButton>
                        </div>
                    </Stack>
                    <ApplicationBoardContent
                        classes={{
                            applicationWrapper: classes.applicationWrapper,
                            recommendFeatureAppListWrapper: classes.recommendFeatureAppListWrapper,
                        }}
                        openDashboard={props.openDashboard}
                        queryOwnedPersonaInformation={props.queryOwnedPersonaInformation}
                        currentSNSNetwork={props.currentSNSNetwork}
                        lastRecognized={props.lastRecognized}
                        allPersonas={props.allPersonas}
                        applicationCurrentStatus={props.applicationCurrentStatus}
                        personaAgainstSNSConnectStatusLoading={props.personaAgainstSNSConnectStatusLoading}
                    />
                </>
            )}
        </>
    )
}
