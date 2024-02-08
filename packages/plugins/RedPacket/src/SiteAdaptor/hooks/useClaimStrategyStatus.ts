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
    const signedMessage = 'privateKey' in payload ? payload.privateKey : payload.password
    const me = useLastRecognizedIdentity()
    return useQuery({
        enabled: !signedMessage && !!platform,
        queryKey: ['red-packet', 'claim-strategy', rpid, platform, author?.userId, account, me],
        queryFn: async () => {
            if (!platform) return null
            return FireflyRedPacket.checkClaimStrategyStatus({
                rpid,
                profile: {
                    needLensAndFarcasterHandle: true,
                    platform,
                    profileId: author?.userId || '',
                    lensToken: me?.lensToken,
                    farcasterMessage: me?.farcasterMessage as HexString,
                    farcasterSigner: me?.farcasterSigner as HexString,
                    farcasterSignature: me?.farcasterSignature as HexString,
                },
                wallet: {
                    address: account,
                },
            })
        },
    })
}
