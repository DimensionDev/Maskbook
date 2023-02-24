import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { SelectProviderDialog } from '../SelectProviderDialog/index.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { getSiteType } from '@masknet/shared-base'
import { useState } from 'react'

export function PluginSelectProviderDialog() {
    const site = getSiteType()
    const { pluginIDSettings, hasNativeAPI } = useSNSAdaptorContext()
    const pluginIDs = useValueRef(pluginIDSettings!)
    const [undeterminedPluginID, setUndeterminedPluginID] = useState(site ? pluginIDs[site] : undefined)

    return <SelectProviderDialog pluginIDs={pluginIDs} hasNativeAPI={hasNativeAPI} />
}
