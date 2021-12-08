import { Plugin, ApplicationEntryConduct, NetworkPluginID } from '@masknet/plugin-infra'
import { base } from '../base'
import { BuyTokenDialog } from './BuyTokenDialog'
import { PLUGIN_NETWORKS } from '../../EVM/constants'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <BuyTokenDialog />
    },
    ApplicationEntries: [
        {
            icon: new URL('./assets/fiat_ramp.png', import.meta.url),
            label: 'Fiat On-Ramp',
            priority: 8,
            conduct: { type: ApplicationEntryConduct.Custom },
            supportedNetworkList: [
                { network: NetworkPluginID.PLUGIN_EVM, chainIdList: PLUGIN_NETWORKS.map((network) => network.chainId) },
                { network: NetworkPluginID.PLUGIN_FLOW, chainIdList: [] },
            ],
            walletRequired: true,
        },
    ],
}

export default sns
