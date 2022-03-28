import { NetworkPluginID, Plugin, usePluginIDContext } from '@masknet/plugin-infra'
import { base } from '../base'
import { CheckSecurityDialog } from './CheckSecurityDialog'
import { useState } from 'react'
import { ApplicationEntry } from '@masknet/shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent(key) {
                const [open, setOpen] = useState(false)
                const currentPluginId = usePluginIDContext()
                return currentPluginId !== NetworkPluginID.PLUGIN_EVM ? null : (
                    <div key={key}>
                        <ApplicationEntry
                            title="Check Security"
                            icon={new URL('../assets/security-icon.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                        />
                        <CheckSecurityDialog open={open} onClose={() => setOpen(false)} />
                    </div>
                )
            },
            defaultSortingPriority: 12,
        },
    ],
}

export default sns
