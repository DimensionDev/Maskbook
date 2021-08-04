import { useAsyncRetry } from 'react-use'
import { getCampaignInfo } from '../../Worker/apis/spaceStationUUPS'

export function useSpaceStationCampaignInfo() {
    return useAsyncRetry(getCampaignInfo, [])
}
