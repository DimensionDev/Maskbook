import { useCallback, useState } from 'react'
import type { ClaimableCount } from '../../types'
import { PluginITO_RPC } from '../../messages'

export function useSpaceStationClaimableTokenCountCallback() {
    const [spaceStationAccountClaimableLoading, setSpaceStationAccountClaimableLoading] = useState(false)
    const [spaceStationClaimableCount, setSpaceStationClaimableCount] = useState<ClaimableCount>()
    const spaceStationAccountClaimableCallback = useCallback(async (address: string) => {
        setSpaceStationAccountClaimableLoading(true)
        const data = await PluginITO_RPC.getClaimableTokenCount(address)
        setSpaceStationAccountClaimableLoading(false)
        setSpaceStationClaimableCount(data)
    }, [])

    return [
        spaceStationClaimableCount,
        spaceStationAccountClaimableCallback,
        spaceStationAccountClaimableLoading,
    ] as const
}
