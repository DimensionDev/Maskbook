import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../../messages'

export function useSpaceStationCampaignInfo() {
    return useAsyncRetry(PluginITO_RPC.getCampaignInfo, [])
}
