import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { usePlatformType } from './usePlatformType.js'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useLastRecognizedIdentity, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

type T = UseQueryResult
export function useClaimStrategyStatus(payload: RedPacketJSONPayload | RedPacketNftJSONPayload) {
    const platform = usePlatformType()
    const author = usePostInfoDetails.author()
    const { pluginID } = useNetworkContext()
    const rpid = 'rpid' in payload ? payload.rpid : payload.id

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: payload.chainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })
    const signedMessage = 'password' in payload ? payload.password : payload.privateKey
    const me = useLastRecognizedIdentity()
    const lensToken = me?.lensToken
    return useQuery({
        enabled: !signedMessage && !!platform,
        queryKey: ['red-packet', 'claim-strategy', rpid, platform, author?.userId, account, lensToken],
        queryFn: async () => {
            if (!platform) return null
            return FireflyRedPacket.checkClaimStrategyStatus({
                rpid,
                profile: {
                    platform,
                    profileId: author?.userId || '',
                    lensToken: lensToken,
                },
                wallet: {
                    address: account,
                },
            })
        },
    })
}
