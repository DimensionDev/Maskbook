import { Plugin, ApplicationEntryConduct, NetworkPluginID } from '@masknet/plugin-infra'
import { base } from '../base'
import { baseDeferred } from '../base-deferred'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { TagInspector } from './trending/TagInspector'
import { PLUGIN_NETWORKS } from '../../EVM/constants'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    ...baseDeferred,
    init(signal) {},
    SearchBoxComponent: SearchResultInspector,
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
                <TraderDialog />
            </>
        )
    },
    ApplicationEntries: [
        {
            icon: new URL('./assets/swap.png', import.meta.url),
            label: 'Swap',
            priority: 7,
            conduct: { type: ApplicationEntryConduct.Custom },
            supportedNetworkList: [
                { network: NetworkPluginID.PLUGIN_EVM, chainIdList: PLUGIN_NETWORKS.map((network) => network.chainId) },
            ],
            walletRequired: true,
        },
    ],
}

export default sns
