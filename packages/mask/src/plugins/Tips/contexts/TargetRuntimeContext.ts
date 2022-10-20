import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { NetworkPluginID } from '@masknet/shared-base'

function useTargetPluginId() {
    const [pluginID, setPluginID] = useState<NetworkPluginID>(NetworkPluginID.PLUGIN_EVM)

    return {
        pluginID,
        setPluginID,
    }
}

export const TargetRuntimeContext = createContainer(useTargetPluginId)
