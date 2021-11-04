import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SelectNetworkDialogEntry: {
        async onSelect(network, provider) {
            console.log(`FLOW DASHBOARD: ${network.ID} ${provider.ID}`)
        },
    },
}

export default sns
