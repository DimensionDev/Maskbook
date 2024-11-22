import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { usePlatformType } from './usePlatformType.js'

export function useClaimStrategyStatus(payload: RedPacketJSONPayload) {
    const platform = usePlatformType()
    const { pluginID } = useNetworkContext()
    const rpid = payload.rpid

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: payload.chainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })
    const signedMessage = 'privateKey' in payload ? payload.privateKey : payload.password
    const me = useLastRecognizedIdentity()
    return useQuery({
        enabled: !signedMessage && !!platform,
        queryKey: ['red-packet', 'claim-strategy', rpid, platform, account, me],
        queryFn: async () => {
            if (!platform || !account) return null
            return FireflyRedPacket.checkClaimStrategyStatus({
                rpid,
                profile: {
                    needLensAndFarcasterHandle: true,
                    platform,
                    profileId: me?.profileId,
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
