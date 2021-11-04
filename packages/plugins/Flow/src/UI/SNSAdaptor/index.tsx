import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { PluginIcon } from '../components/PluginIcon'
import { PluginPanel } from '../components/PluginPanel'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SelectNetworkDialogEntry: {
        async onSelect(network, provider) {
            console.log(`FLOW: ${network.ID} ${provider.ID}`)
        },
    },
}

export default sns
