import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { first } from 'lodash-es'
import { InjectedDialog, usePersonaProofs } from '@masknet/shared'
import {
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
    getSettingsTabContent,
} from '@masknet/plugin-infra/content-script'
import { PluginID, NextIDPlatform, EMPTY_LIST, CrossIsolationMessages, MaskMessages } from '@masknet/shared-base'
import { getAvailablePlugins } from '@masknet/plugin-infra'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../utils/index.js'
import Services from '../../extension/service.js'

const useStyles = makeStyles()((theme) => ({
    titleTailButton: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
    content: {
        position: 'relative',
        minHeight: 528,
        padding: 0,
        boxSizing: 'border-box',
    },
}))

/**
 * @deprecated unused
 */
export function PluginSettingsDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const translate = usePluginI18NField()

    const [open, setOpen] = useState(false)
    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = getAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.SettingTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .sort((a, z) => {
                return a.priority - z.priority
            })
    })

    const tabs = displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))

    const [currentTab, onChange, , setTab] = useTabs<PluginID>(
        first(tabs)?.id ?? PluginID.Tips,
        ...tabs.map((tab) => tab.id),
    )

    const openPopupWindow = useCallback(
        () =>
            Services.Helper.openPopupConnectWindow({
                internal: true,
            }),
        [],
    )

    const { value: currentPersona, retry } = useAsyncRetry(Services.Settings.getCurrentPersonaIdentifier, [])
    const { isLoading, data: proofs } = usePersonaProofs(currentPersona?.publicKeyAsHex)

    const bindingWallets = useMemo(() => {
        if (isLoading || !proofs) return EMPTY_LIST
        return proofs.filter((x) => x.platform === NextIDPlatform.Ethereum)
    }, [proofs, isLoading])

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(retry), [retry])

    const component = useMemo(() => {
        const Component = getSettingsTabContent(currentTab)
        if (!Component) return null
        return (
            <Component
                onClose={() => setOpen(false)}
                bindingWallets={bindingWallets}
                currentPersona={currentPersona}
                pluginID={currentTab}
                onOpenPopup={Services.Helper.openPopupWindow}
            />
        )
    }, [currentTab, bindingWallets, currentPersona])

    useEffect(() => {
        return CrossIsolationMessages.events.settingsDialogEvent.on(({ open, targetTab }) => {
            setOpen(open)

            if (targetTab) setTab(targetTab as PluginID)
        })
    }, [])

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                onClose={() => setOpen(false)}
                title={t('settings')}
                titleTail={<Icons.Wallet size={24} onClick={openPopupWindow} className={classes.titleTailButton} />}
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="SettingTabs">
                        {tabs.map((tab) => (
                            <Tab key={tab.id} label={tab.label} value={tab.id} />
                        ))}
                    </MaskTabList>
                }
                titleBarIconStyle="back">
                <DialogContent className={classes.content}>{component}</DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
