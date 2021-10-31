import { useActivatedPluginsDashboard, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { PLUGIN_ID as EVM_PLUGIN_ID } from '../../../EVM/constants'
import { ProviderTab } from './ProviderTab'

export interface PluginProviderRenderProps {}

export const PluginProviderRender = function (props: PluginProviderRenderProps) {
    const tabs = [...useActivatedPluginsSNSAdaptor(), ...useActivatedPluginsDashboard()]
        .sort((a, b) => {
            if (a.ID === EVM_PLUGIN_ID) return -1
            if (b.ID === EVM_PLUGIN_ID) return 1
            return 1
        })
        .map((plugin) => plugin.SelectProviderDialogEntry!)
        .filter(Boolean)

    return <ProviderTab tabs={tabs} />
}
