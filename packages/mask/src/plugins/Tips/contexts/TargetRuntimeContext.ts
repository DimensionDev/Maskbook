import { NetworkPluginID } from '@masknet/shared-base'
import { useState } from 'react'
import { createContainer } from 'unstated-next'

function useTargetPluginId() {
    const [expectedPluginID, setExpectedPluginID] = useState<NetworkPluginID>(NetworkPluginID.PLUGIN_EVM)

    return {
        pluginID: expectedPluginID,
        setPluginID: setExpectedPluginID,
    }
}

export const TargetRuntimeContext = createContainer(useTargetPluginId)
