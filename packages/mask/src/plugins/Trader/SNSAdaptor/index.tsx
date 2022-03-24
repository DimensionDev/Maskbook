import { Plugin, usePluginIDContext, NetworkPluginID } from '@masknet/plugin-infra'
import { base } from '../base'
import { useChainId } from '@masknet/web3-shared-evm'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { TagInspector } from './trending/TagInspector'
import { enhanceTag } from './cashTag'
import { ApplicationEntry } from '@masknet/shared'
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
            RenderEntryComponent(key) {
                const currentPluginId = usePluginIDContext()
                const chainId = useChainId()
                const isHidden =
                    currentPluginId !== NetworkPluginID.PLUGIN_EVM ||
                    !base.enableRequirement.web3![NetworkPluginID.PLUGIN_EVM]!.supportedChainIds!.includes(chainId)
                const { openDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

                return isHidden ? null : (
                    <div key={key}>
                        <ApplicationEntry
                            title="Swap"
                            icon={new URL('../assets/swap.png', import.meta.url).toString()}
                            onClick={openDialog}
                        />
                    </div>
                )
            },
            defaultSortingPriority: 8,
        },
    ],
}

export default sns
