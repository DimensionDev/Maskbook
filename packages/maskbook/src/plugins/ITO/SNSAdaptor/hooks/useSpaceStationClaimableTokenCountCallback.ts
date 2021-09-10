import { getClaimableTokenCount } from '../../Worker/apis/spaceStationGalaxy'
import { useCallback, useState } from 'react'
import type { ClaimableCount } from '../../types'

export function useSpaceStationClaimableTokenCountCallback() {
    const [spaceStationAccountClaimableLoading, setSpaceStationAccountClaimableLoading] = useState(false)
    const [spaceStationClaimableCount, setSpaceStationClaimableCount] = useState<ClaimableCount>()
    const spaceStationAccountClaimableCallback = useCallback(
        async (address: string) => {
            setSpaceStationAccountClaimableLoading(true)
            const data = await getClaimableTokenCount(address)
            setSpaceStationAccountClaimableLoading(false)
            setSpaceStationClaimableCount(data)
        },
        [setSpaceStationAccountClaimableLoading, getClaimableTokenCount, setSpaceStationAccountClaimableLoading],
    )

    return [
        spaceStationClaimableCount,
        spaceStationAccountClaimableCallback,
        spaceStationAccountClaimableLoading,
    ] as const
}
