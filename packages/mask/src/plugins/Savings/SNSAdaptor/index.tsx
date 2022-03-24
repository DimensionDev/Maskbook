import { Plugin, usePluginIDContext, NetworkPluginID } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent(key) {
                const currentPluginId = usePluginIDContext()

                return currentPluginId !== NetworkPluginID.PLUGIN_EVM ? null : (
                    <div key={key}>
                        <ApplicationEntry
                            title="Savings"
                            icon={new URL('./assets/savings.png', import.meta.url).toString()}
                            onClick={() => {}}
                        />
                    </div>
                )
            },
            defaultSortingPriority: 7,
        },
    ],
}

export default sns
