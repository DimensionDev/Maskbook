import { useMyIdentity } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { usePlatformType } from './usePlatformType.js'

type T = UseQueryResult
export function useClaimStrategyStatus(payload: RedPacketJSONPayload | RedPacketNftJSONPayload) {
    const platform = usePlatformType()
    const { pluginID } = useNetworkContext()
    const rpid = 'rpid' in payload ? payload.rpid : payload.id

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: payload.chainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })
    const signedMessage = 'privateKey' in payload ? payload.privateKey : payload.password
    const myIdentity = useMyIdentity()
    return useQuery({
        enabled: !signedMessage && !!platform,
        queryKey: ['red-packet', 'claim-strategy', rpid, platform, account, myIdentity],
        queryFn: async () => {
            if (!platform) return null
            return FireflyRedPacket.checkClaimStrategyStatus({
                rpid,
                profile: {
                    needLensAndFarcasterHandle: true,
                    platform,
                    profileId: myIdentity?.profileId,
                    lensToken: myIdentity?.lensToken,
                    farcasterMessage: myIdentity?.farcasterMessage as HexString,
                    farcasterSigner: myIdentity?.farcasterSigner as HexString,
                    farcasterSignature: myIdentity?.farcasterSignature as HexString,
                },
                wallet: {
                    address: account,
                },
            })
        },
    })
}
