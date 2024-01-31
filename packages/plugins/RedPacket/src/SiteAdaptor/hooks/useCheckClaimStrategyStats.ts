import { useAccount } from '@masknet/web3-hooks-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { useCallback } from 'react'

export function useCheckClaimStrategyStatus(rpid: string) {
    const account = useAccount()
    const check = useCallback(async () => {
        return FireflyRedPacket.checkClaimStrategyStatus({
            rpid,
            profile: {
                platform: FireflyRedPacketAPI.PlatformType.twitter,
                profileId: 'app',
                lensToken: '',
            },
            wallet: {
                address: account,
            },
        })
    }, [rpid, account])
    return check
}
