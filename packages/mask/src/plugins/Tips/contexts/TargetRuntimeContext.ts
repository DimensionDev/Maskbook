import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { NetworkPluginID } from '@masknet/shared-base'

function useTargetPluginId() {
    const [expectedPluginID, setExpectedPluginID] = useState<NetworkPluginID>(NetworkPluginID.PLUGIN_EVM)

    return {
        pluginID: expectedPluginID,
        setPluginID: setExpectedPluginID,
    }
}

export const TargetRuntimeContext = createContainer(useTargetPluginId)
