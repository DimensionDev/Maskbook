import { useAsyncRetry } from 'react-use'
import { getCampaignInfo } from '../../Worker/apis/spaceStationGalaxy'

export function useSpaceStationCampaignInfo() {
    return useAsyncRetry(getCampaignInfo, [])
}
