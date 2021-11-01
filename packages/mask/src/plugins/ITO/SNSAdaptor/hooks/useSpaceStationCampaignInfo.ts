import { useAsyncRetry } from 'react-use'
import { getCampaignInfo, getClaimableTokenCount } from '../../Worker/apis/spaceStationGalaxy'

export const CAMPAIGN_ID_LIST = [160, 175, 176, 177, 178, 179, 180]

export function useSpaceStationCampaignInfo(address: string, nftAirdropEnabled: boolean) {
    return useAsyncRetry(async () => {
        if (!address || !nftAirdropEnabled) return []
        return Promise.all(
            CAMPAIGN_ID_LIST.map(async (id) => {
                const campaignInfo = await getCampaignInfo(id)
                const data = await getClaimableTokenCount(address, id)
                const claimableInfo = {
                    claimable: data.maxCount - data.usedCount > 0,
                    claimed: data.maxCount > 0 && data.maxCount - data.usedCount === 0,
                }
                return { campaignInfo, claimableInfo }
            }),
        )
    }, [address])
}
