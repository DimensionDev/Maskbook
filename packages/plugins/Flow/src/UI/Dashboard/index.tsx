import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { PluginIcon } from '../components/PluginIcon'
import { PluginPanel } from '../components/PluginPanel'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SelectProviderDialogEntry: {
        name: 'Flow',
        icon: <PluginIcon />,
        panel: <PluginPanel />,
    },
}

export default sns
