import { DialogContent, Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { useState, useCallback } from 'react'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch.js'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList.js'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationBoard } from './ApplicationBoard.js'
import { WalletMessages } from '../../plugins/Wallet/messages.js'
import { useI18N } from '../../utils/index.js'
import { Icons } from '@masknet/icons'
import { PersonaSelectPanelDialog } from './PersonaSelectPanel/PersonaSelectPanelDialog.js'
import { PluginNextIDMessages } from '../../plugins/NextID/messages.js'
import type { PluginID } from '@masknet/plugin-infra'

const useStyles = makeStyles<{
    openSettings: boolean
}>()((theme, { openSettings }) => {
    return {
        content: {
            padding: theme.spacing(1.5, 2, '6px'),
            height: openSettings ? 'auto' : 470,
            overflow: openSettings ? 'hidden scroll' : 'hidden',
        },
        settingIcon: {
            cursor: 'pointer',
        },
    }
})

export enum ApplicationSettingTabs {
    pluginList = 'pluginList',
    pluginSwitch = 'pluginSwitch',
}

export function ApplicationBoardDialog() {
    const [openSettings, setOpenSettings] = useState(false)
    const { classes } = useStyles({ openSettings })
    const { t } = useI18N()
    const [currentTab, onChange, tabs, setTab] = useTabs(
        ApplicationSettingTabs.pluginList,
        ApplicationSettingTabs.pluginSwitch,
    )

    const [focusPluginId, setFocusPluginId] = useState<PluginID>()
    const [quickMode, setQuickMode] = useState(false)

    const { open, closeDialog: closeBoard } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
        (evt) => {
            if (!evt.open || !evt.settings?.switchTab) return
            setOpenSettings(true)
            setQuickMode(evt.settings.quickMode ?? false)
            setTab(ApplicationSettingTabs.pluginSwitch)
            setFocusPluginId(evt.settings?.switchTab?.focusPluginId)
        },
    )

    const reset = useCallback(() => {
        setOpenSettings(false)
        setQuickMode(false)
        setTab(ApplicationSettingTabs.pluginList)
        setFocusPluginId(undefined)
    }, [])

    const { open: openPersonaSelectPanelDialog } = useRemoteControlledDialog(
        PluginNextIDMessages.PersonaSelectPanelDialogUpdated,
    )

    const closeDialog = useCallback(() => {
        if (openSettings && !quickMode) {
            setOpenSettings(false)
            return
        }
        closeBoard()
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
                isOnBack={openSettings && !quickMode}
                onClose={closeDialog}
                titleTabs={
                    openSettings ? (
                        <MaskTabList variant="base" onChange={onChange} aria-label="ApplicationBoard">
                            <Tab label={t('application_settings_tab_app_list')} value={tabs.pluginList} />
                            <Tab label={t('application_settings_tab_plug_in_switch')} value={tabs.pluginSwitch} />
                        </MaskTabList>
                    ) : null
                }
                title={openSettings ? t('application_settings') : t('applications')}
                titleTail={
                    openSettings ? null : (
                        <Icons.Gear size={24} className={classes.settingIcon} onClick={() => setOpenSettings(true)} />
                    )
                }>
                <DialogContent className={classes.content}>
                    {openSettings ? (
                        <>
                            <TabPanel value={tabs.pluginList} style={{ padding: 0 }}>
                                <ApplicationSettingPluginList />
                            </TabPanel>
                            <TabPanel value={tabs.pluginSwitch} style={{ padding: 0 }}>
                                <ApplicationSettingPluginSwitch focusPluginId={focusPluginId} />
                            </TabPanel>
                        </>
                    ) : (
                        <ApplicationBoard closeDialog={closeDialog} />
                    )}
                    {/* TODO: remove this*/}
                    {openPersonaSelectPanelDialog && <PersonaSelectPanelDialog />}
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    ) : null
}
