import { DialogContent, Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { useState, useCallback } from 'react'
import { ApplicationSettingPluginSwitch } from './ApplicationSettingPluginSwitch'
import { ApplicationSettingPluginList } from './ApplicationSettingPluginList'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationBoard } from './ApplicationBoard'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'
import { Icons } from '@masknet/icons'
import { PersonaListDialog } from './PersonaListDialog'
import { PluginNextIDMessages } from '../../plugins/NextID/messages'
import type { PluginId } from '@masknet/plugin-infra'

const useStyles = makeStyles<{ openSettings: boolean }>()((theme, { openSettings }) => {
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

    const [focusPluginId, setFocusPluginId] = useState<PluginId>()

    const { open, closeDialog: closeBoard } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
        (evt) => {
            if (!open) return
            if (evt.settings?.switchTab) {
                setOpenSettings(true)
                setTab(ApplicationSettingTabs.pluginSwitch)
                setFocusPluginId(evt.settings.switchTab.focusPluginId)
            }
        },
    )

    const { open: openPersonaListDialog } = useRemoteControlledDialog(PluginNextIDMessages.PersonaListDialogUpdated)

    const closeDialog = useCallback(() => {
        closeBoard()
        CrossIsolationMessages.events.requestComposition.sendToLocal({
            reason: 'timeline',
            open: false,
        })
    }, [])

    return open ? (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                maxWidth="sm"
                onClose={openSettings ? () => setOpenSettings(false) : closeDialog}
                titleTabs={
                    openSettings ? (
                        <MaskTabList variant="base" onChange={onChange} aria-label="ApplicationBoard">
                            <Tab label={t('application_settings_tab_app_list')} value={tabs.pluginList} />
                            <Tab label={t('application_settings_tab_plug_in_switch')} value={tabs.pluginSwitch} />
                        </MaskTabList>
                    ) : null
                }
                title={t('applications')}
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
                    {openPersonaListDialog && <PersonaListDialog />}
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    ) : null
}
