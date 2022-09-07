import { useI18N, MaskMessages } from '../../utils'
import { InjectedDialog } from '@masknet/shared'
import {
    PluginId,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
    createInjectHooksRenderer,
} from '@masknet/plugin-infra/content-script'
import { NextIDPlatform, EMPTY_LIST, PopupRoutes, CrossIsolationMessages } from '@masknet/shared-base'
import { useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { makeStyles, useTabs } from '@masknet/theme'
import { first } from 'lodash-unified'
import { TabContext } from '@mui/lab'
import { DialogContent } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Icons } from '@masknet/icons'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'

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

function getTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.SettingTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function PluginSettingsDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const translate = usePluginI18NField()

    const [open, setOpen] = useState(false)
    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
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

    const [currentTab, onChange, , setTab] = useTabs(first(tabs)?.id ?? PluginId.Tips, ...tabs.map((tab) => tab.id))

    const openPopupWindow = useCallback(
        () =>
            Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
                internal: true,
            }),
        [],
    )

    const { value: currentPersona, retry } = useAsyncRetry(Services.Settings.getCurrentPersonaIdentifier, [])

    const { value: bindingWallets, retry: retryBindingWallets } = useAsyncRetry(async () => {
        if (!currentPersona) return EMPTY_LIST
        const response = await NextIDProof.queryExistedBindingByPersona(currentPersona.publicKeyAsHex)
        if (!response) return EMPTY_LIST
        const { proofs } = response
        return proofs.filter((x) => x.platform === NextIDPlatform.Ethereum)
    }, [currentPersona])

    useEffect(() => MaskMessages.events.ownProofChanged.on(retryBindingWallets), [retryBindingWallets])

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(retry), [retry])

    const component = useMemo(() => {
        const Component = getTabContent(currentTab)
        if (!Component) return null
        return (
            <Component onClose={() => setOpen(false)} bindingWallets={bindingWallets} currentPersona={currentPersona} />
        )
    }, [currentTab, bindingWallets, currentPersona])

    useEffect(() => {
        return CrossIsolationMessages.events.PluginSettingsDialogUpdate.on(({ open, targetTab }) => {
            setOpen(open)

            if (targetTab) setTab(targetTab)
        })
    }, [])

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                onClose={() => setOpen(false)}
                title={t('settings')}
                titleTail={
                    <Icons.WalletUnderTabs size={24} onClick={openPopupWindow} className={classes.titleTailButton} />
                }
                // titleTabs={
                //     <MaskTabList variant="base" onChange={onChange} aria-label="SettingTabs">
                //         {tabs.map((tab) => (
                //             <Tab key={tab.id} label={tab.label} value={tab.id} />
                //         ))}
                //     </MaskTabList>
                // }
                titleBarIconStyle="back">
                <DialogContent className={classes.content}>{component}</DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
