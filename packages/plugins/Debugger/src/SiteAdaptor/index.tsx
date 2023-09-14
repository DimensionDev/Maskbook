import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { SocialAddressType } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Icons } from '@masknet/icons'
import { Typography } from '@mui/material'
import { base } from '../base.js'
import { PLUGIN_ID, PLUGIN_NAME } from '../constants.js'
import { TabContent } from './components/TabContent.js'
import { ConsoleDialog } from './components/ConsoleDialog.js'
import { PluginDebuggerMessages } from '../messages.js'
import { ConnectionDialog } from './components/ConnectionDialog.js'
import { HubDialog } from './components/HubDialog.js'
import { AvatarDecorator } from './components/AvatarDecorator.js'
import { WidgetDialog } from './components/WidgetDialog.js'
import { SearchResultInspector } from './components/SearchResultInspector.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        {
            ApplicationEntryID: `${PLUGIN_ID}_Debugger`,
            RenderEntryComponent() {
                const { openDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)
                return (
                    <ApplicationEntry
                        title={PLUGIN_NAME}
                        disabled={false}
                        iconFilterColor=""
                        icon={<Icons.MaskBlue size={36} />}
                        onClick={() => {
                            openDialog()
                        }}
                    />
                )
            },
            appBoardSortingDefaultPriority: Number.MAX_SAFE_INTEGER,
            marketListSortingPriority: Number.MAX_SAFE_INTEGER,
            icon: <Icons.MaskBlue size={36} />,
            name: PLUGIN_NAME,
        },
        {
            ApplicationEntryID: `${PLUGIN_ID}_Hub`,
            RenderEntryComponent() {
                const { openDialog } = useRemoteControlledDialog(PluginDebuggerMessages.hubDialogUpdated)
                return (
                    <ApplicationEntry
                        title="Hub"
                        disabled={false}
                        iconFilterColor=""
                        icon={<Icons.MaskBlue size={36} />}
                        onClick={() => {
                            openDialog()
                        }}
                    />
                )
            },
            appBoardSortingDefaultPriority: Number.MAX_SAFE_INTEGER,
            marketListSortingPriority: Number.MAX_SAFE_INTEGER,
            icon: <Icons.MaskBlue size={36} />,
            name: PLUGIN_NAME,
        },
        {
            ApplicationEntryID: `${PLUGIN_ID}_Connection`,
            RenderEntryComponent() {
                const { openDialog } = useRemoteControlledDialog(PluginDebuggerMessages.connectionDialogUpdated)
                return (
                    <ApplicationEntry
                        title="Connection"
                        disabled={false}
                        iconFilterColor=""
                        icon={<Icons.MaskBlue size={36} />}
                        onClick={() => {
                            openDialog()
                        }}
                    />
                )
            },
            appBoardSortingDefaultPriority: Number.MAX_SAFE_INTEGER,
            marketListSortingPriority: Number.MAX_SAFE_INTEGER,
            icon: <Icons.MaskBlue size={36} />,
            name: PLUGIN_NAME,
        },
        {
            ApplicationEntryID: `${PLUGIN_ID}_Widget`,
            RenderEntryComponent() {
                const { openDialog } = useRemoteControlledDialog(PluginDebuggerMessages.widgetDialogUpdated)
                return (
                    <ApplicationEntry
                        title="Widgets"
                        disabled={false}
                        iconFilterColor=""
                        icon={<Icons.MaskBlue size={36} />}
                        onClick={() => {
                            openDialog()
                        }}
                    />
                )
            },
            appBoardSortingDefaultPriority: Number.MAX_SAFE_INTEGER,
            marketListSortingPriority: Number.MAX_SAFE_INTEGER,
            icon: <Icons.MaskBlue size={36} />,
            name: PLUGIN_NAME,
        },
    ],
    GlobalInjection() {
        return (
            <>
                <ConsoleDialog />
                <ConnectionDialog />
                <HubDialog />
                <WidgetDialog />
            </>
        )
    },
    SearchResultInspector: {
        ID: `${PLUGIN_ID}_searchResultInspector`,
        UI: {
            Content: SearchResultInspector,
        },
        Utils: {
            shouldDisplay: (result) => false,
        },
    },
    SearchResultTabs: [
        {
            ID: `${PLUGIN_ID}_resultTab1`,
            label: 'Tab 1',
            priority: 99999,
            Utils: {
                shouldDisplay: (result) => false,
            },
            UI: {
                TabContent({ result }) {
                    return <Typography>Tab 1</Typography>
                },
            },
        },
        {
            ID: `${PLUGIN_ID}_resultTab2`,
            label: 'Tab 2',
            priority: 99999,
            Utils: {
                shouldDisplay: (result) => false,
            },
            UI: {
                TabContent({ result }) {
                    return <Typography>Tab 2</Typography>
                },
            },
        },
    ],
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_profileTabContent`,
            label: 'Debugger',
            priority: 99999,
            UI: {
                TabContent,
            },
            Utils: {
                sorter(a, z) {
                    if (a.supportedAddressTypes?.includes(SocialAddressType.Address)) return 1
                    if (z.supportedAddressTypes?.includes(SocialAddressType.Address)) return -1

                    return 0
                },
            },
        },
    ],
    AvatarRealm: {
        ID: `${PLUGIN_ID}_avatar`,
        label: 'Debugger',
        priority: 99999,
        UI: {
            Decorator: AvatarDecorator,
        },
    },
}

export default site
