import { getClaimableTokenCount } from '../../Worker/apis/spaceStationGalaxy'
import { CAMPAIGN_ID_LIST } from './useSpaceStationCampaignInfo'
import { useCallback, useState } from 'react'

export function useSpaceStationClaimableTokenCountCallback() {
    const [spaceStationAccountClaimableLoading, setSpaceStationAccountClaimableLoading] = useState(false)
    const [spaceStationClaimableCount, setSpaceStationClaimableCount] = useState<number | undefined>(undefined)
    const spaceStationAccountClaimableCallback = useCallback(
        async (address: string) => {
            setSpaceStationAccountClaimableLoading(true)
            const data = await Promise.all(
                CAMPAIGN_ID_LIST.map(async (id) => {
                    const claimableCount = await getClaimableTokenCount(address, id)
                    return claimableCount.maxCount - claimableCount.usedCount > 0
                }),
            )
            setSpaceStationAccountClaimableLoading(false)
            setSpaceStationClaimableCount(data.filter((v) => Boolean(v)).length)
        },
        [setSpaceStationAccountClaimableLoading, getClaimableTokenCount, setSpaceStationAccountClaimableLoading],
    )

    return [
        spaceStationClaimableCount,
        setSpaceStationClaimableCount,
        spaceStationAccountClaimableCallback,
        spaceStationAccountClaimableLoading,
    ] as const
}
