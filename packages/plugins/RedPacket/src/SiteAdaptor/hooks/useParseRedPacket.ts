import {
    useLastRecognizedIdentity,
    usePostInfoPostMetadataImages,
    usePostInfoSource,
} from '@masknet/plugin-infra/content-script'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

/**
 * Parse RedPacket with post info.
 * Firefly only.
 */
export function useParseRedPacket(chainId: ChainId) {
    const images = usePostInfoPostMetadataImages()
    const { pluginID } = useNetworkContext()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })
    const source = usePostInfoSource()
    const me = useLastRecognizedIdentity()
    const myProfileId = me?.profileId

    const query = useQuery({
        enabled: images.length > 0,
        queryKey: ['red-packet', 'parse', source?.toLowerCase(), images[0], account, myProfileId],
        queryFn: async () => {
            const platform = source?.toLowerCase() as FireflyRedPacketAPI.PlatformType
            return FireflyRedPacket.parse({
                image: {
                    imageUrl: images[0],
                },
                walletAddress: account,
                platform,
                profileId: myProfileId,
            })
        },
    })
    return query.data
}
