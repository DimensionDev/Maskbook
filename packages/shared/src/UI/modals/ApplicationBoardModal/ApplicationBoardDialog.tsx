import { useState, useCallback, useEffect } from 'react'
import { DialogContent, IconButton, Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import {
    InjectedDialog,
    LeavePageConfirmModal,
    useSharedI18N,
    type PersonaAgainstSNSConnectStatus,
} from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch.js'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList.js'
import {
    CrossIsolationMessages,
    type DashboardRoutes,
    type PersonaInformation,
    type PluginID,
} from '@masknet/shared-base'
import { ApplicationBoardContent } from './ApplicationBoard.js'
import type { SiteAdaptor, IdentityResolved } from '@masknet/plugin-infra'

const useStyles = makeStyles<{
    openSettings: boolean
}>()((theme, { openSettings }) => {
    return {
        content: {
            padding: theme.spacing(1.5, openSettings ? 2 : 0, '6px'),
            height: openSettings ? 'auto' : 546,
            overflow: openSettings ? 'hidden scroll' : 'hidden',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

export enum ApplicationSettingTabs {
    pluginList = 'pluginList',
    pluginSwitch = 'pluginSwitch',
}

interface ApplicationBoardProps {
    open: boolean
    onClose: () => void

    openDashboard?: (route?: DashboardRoutes, search?: string) => void
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    currentSite?: SiteAdaptor
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

export function ApplicationBoard({
    open,
    onClose,
    openDashboard,
    queryOwnedPersonaInformation,
    currentSite,
    allPersonas,
    lastRecognized,
    applicationCurrentStatus,
    personaAgainstSNSConnectStatusLoading,
    setPluginMinimalModeEnabled,
    getDecentralizedSearchSettings,
    setDecentralizedSearchSettings,
    quickMode = false,
    tab = ApplicationSettingTabs.pluginSwitch,
    focusPluginID,
}: ApplicationBoardProps) {
    const [openSettings, setOpenSettings] = useState(false)
    const { classes } = useStyles({ openSettings })
    const t = useSharedI18N()
    const [currentTab, onChange, tabs, setTab] = useTabs(
        ApplicationSettingTabs.pluginList,
        ApplicationSettingTabs.pluginSwitch,
    )

    useEffect(() => setTab(tab), [tab])

    const reset = useCallback(() => {
        setOpenSettings(false)
        setTab(ApplicationSettingTabs.pluginList)
    }, [])

    const closeDialog = useCallback(() => {
        if (openSettings && !quickMode) {
            setOpenSettings(false)
            return
        }
        onClose()
        CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
            reason: 'timeline',
            open: false,
        })
        reset()
    }, [openSettings, quickMode, reset])

    return open ? (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                maxWidth="sm"
                isOnBack={!!(openSettings && !quickMode)}
                onClose={closeDialog}
                titleTabs={
                    openSettings ? (
                        <MaskTabList variant="base" onChange={onChange} aria-label="ApplicationBoard">
                            <Tab label={t.application_settings_tab_app_list()} value={tabs.pluginList} />
                            <Tab label={t.application_settings_tab_plug_in_switch()} value={tabs.pluginSwitch} />
                        </MaskTabList>
                    ) : null
                }
                titleBarIconStyle={openSettings && !quickMode ? 'back' : 'close'}
                independent={LeavePageConfirmModal.peek()}
                title={openSettings ? t.application_settings() : t.applications()}
                titleTail={
                    openSettings ? null : (
                        <IconButton size="small" sx={{ margin: '-5px' }} onClick={() => setOpenSettings(true)}>
                            <Icons.Gear size={24} />
                        </IconButton>
                    )
                }>
                <DialogContent className={classes.content}>
                    {openSettings ? (
                        <>
                            <TabPanel value={tabs.pluginList} style={{ padding: 0 }}>
                                <ApplicationSettingPluginList />
                            </TabPanel>
                            <TabPanel value={tabs.pluginSwitch} style={{ padding: 0 }}>
                                <ApplicationSettingPluginSwitch
                                    focusPluginID={focusPluginID}
                                    setPluginMinimalModeEnabled={setPluginMinimalModeEnabled}
                                    getDecentralizedSearchSettings={getDecentralizedSearchSettings}
                                    setDecentralizedSearchSettings={setDecentralizedSearchSettings}
                                />
                            </TabPanel>
                        </>
                    ) : (
                        <ApplicationBoardContent
                            openDashboard={openDashboard}
                            queryOwnedPersonaInformation={queryOwnedPersonaInformation}
                            currentSite={currentSite}
                            lastRecognized={lastRecognized}
                            allPersonas={allPersonas}
                            applicationCurrentStatus={applicationCurrentStatus}
                            personaAgainstSNSConnectStatusLoading={personaAgainstSNSConnectStatusLoading}
                        />
                    )}
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    ) : null
}
