import { useI18N } from '../../utils'
import { InjectedDialog } from '@masknet/shared'
import {
    PluginId,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
    createInjectHooksRenderer,
} from '@masknet/plugin-infra/content-script'
import { useAvailablePlugins, useChainId } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, PopupRoutes, CrossIsolationMessages } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { first } from 'lodash-unified'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Services from '../../extension/service'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    titleTailButton: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
}))

function getTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.SettingTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

export function PluginSettingDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const translate = usePluginI18NField()
    const chainId = useChainId()

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

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginId.Tips, ...tabs.map((tab) => tab.id))

    const openPopupWindow = useCallback(
        () =>
            Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
                chainId,
                internal: true,
            }),
        [chainId],
    )

    const component = useMemo(() => {
        const Component = getTabContent(currentTab)
        if (!Component) return null
        return <Component onClose={() => setOpen(false)} />
    }, [currentTab])

    useEffect(() => {
        return CrossIsolationMessages.events.pluginSettingDialogUpdate.on(({ open }) => {
            setOpen(open)
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
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="SettingTabs">
                        {tabs.map((tab) => (
                            <Tab key={tab.id} label={tab.label} value={tab.id} />
                        ))}
                    </MaskTabList>
                }>
                <DialogContent>{component}</DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
