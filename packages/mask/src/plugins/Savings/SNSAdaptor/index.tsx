import { Plugin, usePluginIDContext, NetworkPluginID } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useState } from 'react'
import { useChainId } from '@masknet/web3-shared-evm'
import { base } from '../base'
import { SavingsDialog } from './SavingsDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent(key) {
                const currentPluginId = usePluginIDContext()
                const chainId = useChainId()
                const [open, setOpen] = useState(false)
                const isHidden =
                    currentPluginId !== NetworkPluginID.PLUGIN_EVM ||
                    !base.enableRequirement.web3![NetworkPluginID.PLUGIN_EVM]!.supportedChainIds!.includes(chainId)
                return isHidden ? null : (
                    <div key={key}>
                        <ApplicationEntry
                            title="Savings"
                            icon={new URL('./assets/savings.png', import.meta.url).toString()}
                            onClick={() => setOpen(true)}
                        />
                        <SavingsDialog open={open} onClose={() => setOpen(false)} />
                    </div>
                )
            },
            defaultSortingPriority: 7,
        },
    ],
}

export default sns
