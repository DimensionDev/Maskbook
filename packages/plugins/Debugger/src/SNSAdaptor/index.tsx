import type { Plugin } from '@masknet/plugin-infra'
import { SocialAddressType } from '@masknet/web3-shared-base'
import { base } from '../base'
import { PLUGIN_ID, PLUGIN_NAME } from '../constants'
import { TabContent } from './components/TabContent'
import { ConsoleDialog } from './components/ConsoleDialog'
import { ApplicationEntry } from '@masknet/shared'
import { MaskBlueIcon } from '@masknet/icons'
import { useRemoteControlledDialog } from '../../../../shared-base-ui/src/hooks'
import { PluginDebuggerMessages } from '../messages'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            ApplicationEntryID: PLUGIN_ID,
            RenderEntryComponent() {
                const { openDialog } = useRemoteControlledDialog(PluginDebuggerMessages.consoleDialogUpdated)
                return (
                    <ApplicationEntry
                        title={PLUGIN_NAME}
                        disabled={false}
                        iconFilterColor=""
                        icon={<MaskBlueIcon />}
                        onClick={() => {
                            openDialog()
                        }}
                    />
                )
            },
            appBoardSortingDefaultPriority: Number.MAX_SAFE_INTEGER,
            marketListSortingPriority: Number.MAX_SAFE_INTEGER,
            icon: <MaskBlueIcon />,
            name: PLUGIN_NAME,
        },
    ],
    GlobalInjection() {
        return (
            <>
                <ConsoleDialog />
            </>
        )
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'Debugger',
            priority: 99999,
            UI: {
                TabContent,
            },
            Utils: {
                sorter(a, z) {
                    if (a.type === SocialAddressType.ADDRESS) return 1
                    if (z.type === SocialAddressType.ADDRESS) return -1

                    return 0
                },
            },
        },
    ],
}

export default sns
