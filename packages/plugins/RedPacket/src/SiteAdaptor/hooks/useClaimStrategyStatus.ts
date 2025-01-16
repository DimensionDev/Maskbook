import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { usePlatformType } from './usePlatformType.js'

export function useClaimStrategyStatus(payload: RedPacketJSONPayload | RedPacketNftJSONPayload) {
    const platform = usePlatformType()
    const { pluginID } = useNetworkContext()
    const rpid = 'rpid' in payload ? payload.rpid : payload.id

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: payload.chainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })
    const signedMessage = 'privateKey' in payload ? payload.privateKey : payload.password
    const me = useLastRecognizedIdentity()
    return useQuery({
        // decentralized wallet can be claimed directly.
        enabled: !signedMessage && !!platform,
        queryKey: ['red-packet', 'claim-strategy', rpid, platform, account, me],
        queryFn: async () => {
            if (!platform) return null
            return FireflyRedPacket.checkClaimStrategyStatus({
                rpid,
                profile: {
                    needLensAndFarcasterHandle: true,
                    platform,
                    profileId: me?.profileId,
                },
                wallet: {
                    address: account,
                },
            })
        },
    })
}
