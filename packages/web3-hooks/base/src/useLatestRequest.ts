import { last } from 'lodash-es'
import { useRequests } from './useRequests.js'
import type { NetworkPluginID } from '@masknet/shared-base'

export function useLatestRequest<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const requests = useRequests(pluginID)
    return last(requests)
}
