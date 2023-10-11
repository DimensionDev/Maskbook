import { useState } from 'react'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { IconButton, Stack, Tab } from '@mui/material'
import { ArrowBackRounded as ArrowBackRoundedIcon } from '@mui/icons-material'
import type { DashboardRoutes, EnhanceableSite, PersonaInformation, PluginID } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { ApplicationSettingTabs } from './ApplicationBoardDialog.js'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList.js'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch.js'
import { ApplicationBoardContent } from './ApplicationBoard.js'
import { useSharedTrans, type PersonaPerSiteConnectStatus } from '../../../index.js'

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

export interface ApplicationBoardFormProps {
    openDashboard?: (route?: DashboardRoutes, search?: string) => void
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    currentSite?: EnhanceableSite
    allPersonas: PersonaInformation[]
    lastRecognized?: IdentityResolved
    applicationCurrentStatus?: PersonaPerSiteConnectStatus
    personaPerSiteConnectStatusLoading: boolean
    setPluginMinimalModeEnabled?: (id: string, checked: boolean) => Promise<void>

    focusPluginID?: PluginID
    tab?: ApplicationSettingTabs
    quickMode?: boolean
}

export function ApplicationBoardForm(props: ApplicationBoardFormProps) {
    const t = useSharedTrans()
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
                        currentSite={props.currentSite}
                        lastRecognized={props.lastRecognized}
                        allPersonas={props.allPersonas}
                        applicationCurrentStatus={props.applicationCurrentStatus}
                        personaPerSiteConnectStatusLoading={props.personaPerSiteConnectStatusLoading}
                    />
                </>
            )}
        </>
    )
}
