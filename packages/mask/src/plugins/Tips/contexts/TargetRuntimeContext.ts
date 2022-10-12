import { NetworkPluginID } from '@masknet/shared-base'
import { useState } from 'react'
import { createContainer } from 'unstated-next'

function useTargetPluginId() {
    const [expectedPluginId, setExpectedPluginId] = useState<NetworkPluginID>(NetworkPluginID.PLUGIN_EVM)

    return {
        pluginId: expectedPluginId,
        setPluginId: setExpectedPluginId,
    }
}

export const TargetRuntimeContext = createContainer(useTargetPluginId)
