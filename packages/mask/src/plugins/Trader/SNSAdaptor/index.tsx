import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { TagInspector } from './trending/TagInspector'
import { enhanceTag } from './cashTag'
import { ApplicationEntry } from '@masknet/shared'
import { SwapIcon } from '@masknet/icons'
import { PluginTraderMessages } from '../messages'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchResultBox: SearchResultInspector,
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
                <TraderDialog />
            </>
        )
    },
    enhanceTag,
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled, AppIcon }) {
                const { openDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

                return <ApplicationEntry disabled={disabled} title="Swap" AppIcon={AppIcon} onClick={openDialog} />
            },
            defaultSortingPriority: 8,
            AppIcon: <SwapIcon />,
            isInDappList: true,
            name: 'Swap',
            description:
                'Pop-up trading widget that allows you to instantly view prices of the hottest Crypto/Stock and trade. Can also invest in the best performing managers.',
        },
    ],
}

export default sns
